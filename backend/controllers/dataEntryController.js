const { pool } = require("../config/database")

// Verificar si la carga está disponible
const checkDataEntryStatus = async (req, res) => {
  try {
    const now = new Date()
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    // La carga está disponible del día 1 al 5 de cada mes para el mes anterior
    const isDataEntryOpen = currentDay >= 1 && currentDay <= 5
    
    // Determinar el mes/año objetivo (mes anterior)
    let targetMonth = currentMonth - 1
    let targetYear = currentYear
    
    if (targetMonth === 0) {
      targetMonth = 12
      targetYear = currentYear - 1
    }
    
    // Verificar estado específico por usuario
    const userId = req.user.id
    const userRole = req.user.rol
    
    // Si es admin, puede ver el estado pero no cargar datos directamente
    if (userRole === 'administrador') {
      return res.json({
        success: true,
        data: {
          isDataEntryOpen,
          targetMonth,
          targetYear,
          currentDay,
          message: isDataEntryOpen ? 
            "Período de carga abierto (solo para encargados)" : 
            "Período de carga cerrado",
          userCanEntry: false,
          isAdmin: true
        }
      })
    }
    
    // Para encargados, verificar indicadores asignados
    const [assignedIndicators] = await pool.execute(`
      SELECT 
        i.id,
        i.nombre,
        u.simbolo as unidad,
        c.nombre as categoria,
        EXISTS(
          SELECT 1 FROM registros r 
          WHERE r.indicador_id = i.id 
          AND r.usuario_id = ? 
          AND r.mes = ? 
          AND r.ano = ?
        ) as ya_cargado
      FROM indicadores i
      INNER JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
      INNER JOIN unidades u ON i.unidad_id = u.id
      INNER JOIN categorias c ON i.categoria_id = c.id
      WHERE ai.usuario_id = ?
      ORDER BY c.nombre, i.nombre
    `, [userId, targetMonth, targetYear, userId])

    const totalIndicators = assignedIndicators.length
    const loadedIndicators = assignedIndicators.filter(ind => ind.ya_cargado).length
    
    res.json({
      success: true,
      data: {
        isDataEntryOpen,
        targetMonth,
        targetYear,
        currentDay,
        message: isDataEntryOpen ? 
          "Período de carga abierto - Datos para " + getMonthName(targetMonth) + " " + targetYear :
          "Período de carga cerrado - Próxima ventana: 1-5 del próximo mes",
        userCanEntry: isDataEntryOpen,
        assignedIndicators,
        totalIndicators,
        loadedIndicators,
        pendingIndicators: totalIndicators - loadedIndicators,
        isAdmin: false
      }
    })
  } catch (error) {
    console.error("Error al verificar estado de carga:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Obtener formulario de carga para un usuario
const getDataEntryForm = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.rol
    
    // Solo encargados pueden acceder al formulario
    if (userRole !== 'encargado') {
      return res.status(403).json({
        success: false,
        message: "Solo los encargados pueden acceder al formulario de carga"
      })
    }
    
    const now = new Date()
    const currentDay = now.getDate()
    const isDataEntryOpen = currentDay >= 1 && currentDay <= 5
    
    if (!isDataEntryOpen) {
      return res.status(400).json({
        success: false,
        message: "El período de carga de datos está cerrado"
      })
    }
    
    // Calcular mes/año objetivo
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    let targetMonth = currentMonth - 1
    let targetYear = currentYear
    
    if (targetMonth === 0) {
      targetMonth = 12
      targetYear = currentYear - 1
    }
    
    // Obtener indicadores asignados con datos existentes
    const [indicators] = await pool.execute(`
      SELECT 
        i.id,
        i.nombre,
        i.descripcion,
        u.simbolo as unidad,
        c.nombre as categoria,
        c.id as categoria_id,
        r.valor as valor_actual,
        r.observaciones as observaciones_actuales,
        r.estado as estado_registro
      FROM indicadores i
      INNER JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
      INNER JOIN unidades u ON i.unidad_id = u.id
      INNER JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN registros r ON i.id = r.indicador_id 
        AND r.usuario_id = ? 
        AND r.mes = ? 
        AND r.ano = ?
      WHERE ai.usuario_id = ?
      ORDER BY c.nombre, i.nombre
    `, [userId, targetMonth, targetYear, userId])
    
    // Agrupar por categoría
    const groupedIndicators = {}
    indicators.forEach(indicator => {
      if (!groupedIndicators[indicator.categoria]) {
        groupedIndicators[indicator.categoria] = {
          id: indicator.categoria_id,
          nombre: indicator.categoria,
          indicadores: []
        }
      }
      groupedIndicators[indicator.categoria].indicadores.push({
        id: indicator.id,
        nombre: indicator.nombre,
        descripcion: indicator.descripcion,
        unidad: indicator.unidad,
        valor_actual: indicator.valor_actual,
        observaciones_actuales: indicator.observaciones_actuales,
        estado_registro: indicator.estado_registro,
        ya_cargado: indicator.valor_actual !== null
      })
    })
    
    res.json({
      success: true,
      data: {
        targetMonth,
        targetYear,
        monthName: getMonthName(targetMonth),
        categories: Object.values(groupedIndicators),
        totalIndicators: indicators.length,
        loadedIndicators: indicators.filter(ind => ind.valor_actual !== null).length
      }
    })
  } catch (error) {
    console.error("Error al obtener formulario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Guardar datos del formulario
const saveDataEntry = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.rol
    const { registros } = req.body // Array de { indicador_id, valor, observaciones }
    
    // Solo encargados pueden guardar datos
    if (userRole !== 'encargado') {
      return res.status(403).json({
        success: false,
        message: "Solo los encargados pueden guardar datos"
      })
    }
    
    const now = new Date()
    const currentDay = now.getDate()
    const isDataEntryOpen = currentDay >= 1 && currentDay <= 5
    
    if (!isDataEntryOpen) {
      return res.status(400).json({
        success: false,
        message: "El período de carga de datos está cerrado"
      })
    }
    
    if (!registros || !Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un registro"
      })
    }
    
    // Calcular mes/año objetivo
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    let targetMonth = currentMonth - 1
    let targetYear = currentYear
    
    if (targetMonth === 0) {
      targetMonth = 12
      targetYear = currentYear - 1
    }
    
    // Validar que todos los indicadores pertenezcan al usuario
    const indicatorIds = registros.map(r => r.indicador_id)
    const [assignedIndicators] = await pool.execute(`
      SELECT indicador_id 
      FROM asignacion_indicadores 
      WHERE usuario_id = ? AND indicador_id IN (${indicatorIds.map(() => '?').join(',')})
    `, [userId, ...indicatorIds])
    
    if (assignedIndicators.length !== indicatorIds.length) {
      return res.status(400).json({
        success: false,
        message: "Algunos indicadores no están asignados a este usuario"
      })
    }
    
    // Procesar cada registro
    let processedCount = 0
    const errors = []
    
    for (const registro of registros) {
      const { indicador_id, valor, observaciones } = registro
      
      // Validaciones
      if (typeof valor !== 'number' || valor < 0) {
        errors.push(`Valor inválido para indicador ${indicador_id}`)
        continue
      }
      
      try {
        // Insertar o actualizar registro
        await pool.execute(`
          INSERT INTO registros (indicador_id, usuario_id, valor, mes, ano, observaciones, estado)
          VALUES (?, ?, ?, ?, ?, ?, 'cargado')
          ON DUPLICATE KEY UPDATE
          valor = VALUES(valor),
          observaciones = VALUES(observaciones),
          estado = VALUES(estado),
          fecha_actualizacion = CURRENT_TIMESTAMP
        `, [indicador_id, userId, valor, targetMonth, targetYear, observaciones || null])
        
        processedCount++
      } catch (error) {
        console.error(`Error procesando indicador ${indicador_id}:`, error)
        errors.push(`Error procesando indicador ${indicador_id}`)
      }
    }
    
    res.json({
      success: true,
      message: `Se procesaron ${processedCount} registros exitosamente`,
      data: {
        processedCount,
        totalSubmitted: registros.length,
        errors: errors.length > 0 ? errors : null
      }
    })
  } catch (error) {
    console.error("Error al guardar datos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Obtener historial de cargas del usuario
const getDataEntryHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 12, offset = 0 } = req.query
    
    const [history] = await pool.execute(`
      SELECT 
        r.mes,
        r.ano,
        COUNT(*) as total_registros,
        SUM(CASE WHEN r.estado = 'cargado' THEN 1 ELSE 0 END) as registros_manuales,
        SUM(CASE WHEN r.estado = 'cargado_con_ceros' THEN 1 ELSE 0 END) as registros_automaticos,
        r.fecha_registro,
        DATE_FORMAT(r.fecha_registro, '%d/%m/%Y %H:%i') as fecha_formateada
      FROM registros r
      WHERE r.usuario_id = ?
      GROUP BY r.mes, r.ano
      ORDER BY r.ano DESC, r.mes DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)])
    
    // Formatear datos
    const formattedHistory = history.map(record => ({
      ...record,
      periodo: `${getMonthName(record.mes)} ${record.ano}`,
      porcentaje_manual: Math.round((record.registros_manuales / record.total_registros) * 100)
    }))
    
    res.json({
      success: true,
      data: formattedHistory
    })
  } catch (error) {
    console.error("Error al obtener historial:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Función auxiliar para obtener nombre del mes
function getMonthName(monthNumber) {
  const months = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[monthNumber] || 'Mes inválido'
}

module.exports = {
  checkDataEntryStatus,
  getDataEntryForm,
  saveDataEntry,
  getDataEntryHistory
}