const { pool } = require("../config/database")

// Obtener registros mensuales del usuario
const getUserRecords = async (req, res) => {
  try {
    const userId = req.user.id
    const { year, month } = req.query

    let query = `
      SELECT 
        rm.id,
        rm.mes,
        rm.anio,
        rm.valor,
        rm.estado,
        rm.fecha_carga,
        rm.desbloqueado,
        i.nombre as indicador_nombre,
        i.descripcion as indicador_descripcion,
        u.simbolo as unidad,
        c.nombre as categoria
      FROM registros_mensuales rm
      JOIN indicadores i ON rm.indicador_id = i.id
      JOIN unidades u ON i.unidad_id = u.id
      JOIN categorias c ON i.categoria_id = c.id
      JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
      WHERE ai.usuario_id = ?
    `

    const params = [userId]

    if (year) {
      query += " AND rm.anio = ?"
      params.push(year)
    }

    if (month) {
      query += " AND rm.mes = ?"
      params.push(month)
    }

    query += " ORDER BY rm.anio DESC, rm.mes DESC, c.nombre, i.nombre"

    const [records] = await pool.execute(query, params)

    res.json({
      success: true,
      data: records,
    })
  } catch (error) {
    console.error("Error al obtener registros:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Crear o actualizar registro mensual
const createOrUpdateRecord = async (req, res) => {
  try {
    const userId = req.user.id
    const { indicador_id, mes, anio, valor } = req.body

    // Validaciones
    if (!indicador_id || !mes || !anio || valor === undefined) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (mes < 1 || mes > 12) {
      return res.status(400).json({
        success: false,
        message: "El mes debe estar entre 1 y 12",
      })
    }

    if (valor < 0) {
      return res.status(400).json({
        success: false,
        message: "El valor no puede ser negativo",
      })
    }

    // Verificar que el usuario tiene asignado este indicador
    const [assignments] = await pool.execute(
      "SELECT id FROM asignacion_indicadores WHERE usuario_id = ? AND indicador_id = ?",
      [userId, indicador_id],
    )

    if (assignments.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para cargar datos de este indicador",
      })
    }

    // Verificar si ya existe un registro para este período
    const [existingRecords] = await pool.execute(
      "SELECT id, valor, estado, desbloqueado FROM registros_mensuales WHERE indicador_id = ? AND usuario_id = ? AND mes = ? AND anio = ?",
      [indicador_id, mes, anio, userId],
    )

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const currentDay = currentDate.getDate()

    // Verificar si el período de carga está abierto
    const isCurrentPeriod = anio === currentYear && mes === currentMonth - 1 // Mes anterior
    const isLoadingPeriodOpen = currentDay >= 1 && currentDay <= 5 // Del 1 al 5 del mes

    if (existingRecords.length > 0) {
      const existingRecord = existingRecords[0]

      // Si el registro existe y no está desbloqueado, verificar período de carga
      if (!existingRecord.desbloqueado && !isCurrentPeriod) {
        return res.status(400).json({
          success: false,
          message: "El período de carga para este mes ya está cerrado",
        })
      }

      if (!existingRecord.desbloqueado && isCurrentPeriod && !isLoadingPeriodOpen) {
        return res.status(400).json({
          success: false,
          message: "El período de carga está cerrado. Solo se puede cargar del 1 al 5 de cada mes",
        })
      }

      // Crear registro de auditoría
      await pool.execute(
        "INSERT INTO auditoria_registros (registro_id, usuario_modificador_id, valor_anterior, valor_nuevo, motivo) VALUES (?, ?, ?, ?, ?)",
        [existingRecord.id, userId, existingRecord.valor, valor, "Actualización de registro"],
      )

      // Actualizar registro existente
      await pool.execute(
        "UPDATE registros_mensuales SET valor = ?, estado = 'Cargado', fecha_carga = NOW() WHERE id = ?",
        [valor, existingRecord.id],
      )

      res.json({
        success: true,
        message: "Registro actualizado exitosamente",
      })
    } else {
      // Verificar período de carga para nuevos registros
      if (!isCurrentPeriod || !isLoadingPeriodOpen) {
        return res.status(400).json({
          success: false,
          message: "Solo se pueden cargar datos del mes anterior durante los primeros 5 días del mes",
        })
      }

      // Crear nuevo registro
      const [result] = await pool.execute(
        "INSERT INTO registros_mensuales (indicador_id, usuario_id, mes, anio, valor, estado, fecha_carga) VALUES (?, ?, ?, ?, ?, 'Cargado', NOW())",
        [indicador_id, userId, mes, anio, valor],
      )

      res.status(201).json({
        success: true,
        message: "Registro creado exitosamente",
        data: { id: result.insertId },
      })
    }
  } catch (error) {
    console.error("Error al crear/actualizar registro:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener indicadores asignados con estado de carga
const getAssignedIndicatorsWithStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const { year, month } = req.query

    const currentDate = new Date()
    const targetYear = year ? Number.parseInt(year) : currentDate.getFullYear()
    const targetMonth = month ? Number.parseInt(month) : currentDate.getMonth() // Mes anterior

    const [indicators] = await pool.execute(
      `
      SELECT 
        i.id,
        i.nombre,
        i.descripcion,
        c.nombre as categoria,
        u.simbolo as unidad,
        u.descripcion as unidad_descripcion,
        rm.valor,
        rm.estado,
        rm.fecha_carga,
        rm.desbloqueado
      FROM indicadores i
      JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
      JOIN categorias c ON i.categoria_id = c.id
      JOIN unidades u ON i.unidad_id = u.id
      LEFT JOIN registros_mensuales rm ON i.id = rm.indicador_id 
        AND rm.usuario_id = ? 
        AND rm.mes = ? 
        AND rm.anio = ?
      WHERE ai.usuario_id = ?
      ORDER BY c.nombre, i.nombre
      `,
      [userId, targetMonth, targetYear, userId],
    )

    // Verificar si el período de carga está abierto
    const currentDay = currentDate.getDate()
    const isLoadingPeriodOpen = currentDay >= 1 && currentDay <= 5

    res.json({
      success: true,
      data: {
        indicators,
        loadingPeriodOpen: isLoadingPeriodOpen,
        targetMonth,
        targetYear,
      },
    })
  } catch (error) {
    console.error("Error al obtener indicadores asignados:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

module.exports = {
  getUserRecords,
  createOrUpdateRecord,
  getAssignedIndicatorsWithStatus,
}
