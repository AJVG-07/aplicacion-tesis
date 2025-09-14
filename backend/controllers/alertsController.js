const { pool } = require("../config/database")

// Obtener alertas del usuario
const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 20, offset = 0, unreadOnly = false } = req.query

    let query = `
      SELECT 
        a.id,
        a.tipo_alerta,
        a.descripcion,
        a.valor_umbral,
        a.fecha_generada,
        a.leida,
        i.nombre as indicador_nombre,
        c.nombre as categoria
      FROM alertas a
      JOIN indicadores i ON a.indicador_id = i.id
      JOIN categorias c ON i.categoria_id = c.id
    `

    const params = []
    const conditions = []

    // Filtrar por usuario si es encargado
    if (req.user.rol === "encargado") {
      query += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id"
      conditions.push("ai.usuario_id = ?")
      params.push(userId)
    }

    // Filtrar solo no leídas si se solicita
    if (unreadOnly === "true") {
      conditions.push("a.leida = FALSE")
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY a.fecha_generada DESC LIMIT ? OFFSET ?"
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [alerts] = await pool.execute(query, params)

    // Contar total de alertas no leídas
    let countQuery = `
      SELECT COUNT(*) as total
      FROM alertas a
      JOIN indicadores i ON a.indicador_id = i.id
    `

    const countParams = []
    const countConditions = ["a.leida = FALSE"]

    if (req.user.rol === "encargado") {
      countQuery += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id"
      countConditions.push("ai.usuario_id = ?")
      countParams.push(userId)
    }

    countQuery += " WHERE " + countConditions.join(" AND ")

    const [countResult] = await pool.execute(countQuery, countParams)

    res.json({
      success: true,
      data: {
        alerts,
        unreadCount: countResult[0].total,
      },
    })
  } catch (error) {
    console.error("Error al obtener alertas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Marcar alerta como leída
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params
    const userId = req.user.id

    // Verificar que la alerta existe y el usuario tiene permisos
    let query = `
      SELECT a.id
      FROM alertas a
      JOIN indicadores i ON a.indicador_id = i.id
    `

    const params = [alertId]

    if (req.user.rol === "encargado") {
      query += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id WHERE a.id = ? AND ai.usuario_id = ?"
      params.push(userId)
    } else {
      query += " WHERE a.id = ?"
    }

    const [alerts] = await pool.execute(query, params)

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alerta no encontrada o sin permisos",
      })
    }

    // Marcar como leída
    await pool.execute("UPDATE alertas SET leida = TRUE WHERE id = ?", [alertId])

    res.json({
      success: true,
      message: "Alerta marcada como leída",
    })
  } catch (error) {
    console.error("Error al marcar alerta como leída:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Marcar todas las alertas como leídas
const markAllAlertsAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    let query = "UPDATE alertas a JOIN indicadores i ON a.indicador_id = i.id"
    const params = []

    if (req.user.rol === "encargado") {
      query += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id SET a.leida = TRUE WHERE ai.usuario_id = ?"
      params.push(userId)
    } else {
      query += " SET a.leida = TRUE WHERE a.leida = FALSE"
    }

    await pool.execute(query, params)

    res.json({
      success: true,
      message: "Todas las alertas marcadas como leídas",
    })
  } catch (error) {
    console.error("Error al marcar todas las alertas como leídas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Crear nueva alerta (solo admin)
const createAlert = async (req, res) => {
  try {
    const { indicador_id, tipo_alerta, descripcion, valor_umbral } = req.body

    if (!indicador_id || !tipo_alerta || !descripcion) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos: indicador_id, tipo_alerta, descripcion",
      })
    }

    // Verificar que el indicador existe
    const [indicators] = await pool.execute("SELECT id FROM indicadores WHERE id = ?", [indicador_id])

    if (indicators.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Indicador no encontrado",
      })
    }

    // Crear alerta
    const [result] = await pool.execute(
      "INSERT INTO alertas (indicador_id, tipo_alerta, descripcion, valor_umbral) VALUES (?, ?, ?, ?)",
      [indicador_id, tipo_alerta, descripcion, valor_umbral],
    )

    res.status(201).json({
      success: true,
      message: "Alerta creada exitosamente",
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error("Error al crear alerta:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Sistema automático de detección de valores atípicos
const detectAnomalousValues = async () => {
  try {
    console.log("Iniciando detección de valores atípicos...")

    // Obtener registros del último mes
    const [recentRecords] = await pool.execute(`
      SELECT 
        rm.id,
        rm.indicador_id,
        rm.valor,
        rm.mes,
        rm.anio,
        i.nombre as indicador_nombre,
        AVG(rm2.valor) as promedio_historico,
        STDDEV(rm2.valor) as desviacion_estandar
      FROM registros_mensuales rm
      JOIN indicadores i ON rm.indicador_id = i.id
      JOIN registros_mensuales rm2 ON rm.indicador_id = rm2.indicador_id 
        AND rm2.id != rm.id
        AND rm2.fecha_carga >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      WHERE rm.fecha_carga >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      GROUP BY rm.id
      HAVING COUNT(rm2.id) >= 3
    `)

    // Detectar valores atípicos (más de 2 desviaciones estándar)
    const anomalies = recentRecords.filter((record) => {
      const threshold = 2 * record.desviacion_estandar
      const deviation = Math.abs(record.valor - record.promedio_historico)
      return deviation > threshold
    })

    // Crear alertas para valores atípicos
    for (const anomaly of anomalies) {
      // Verificar si ya existe una alerta similar
      const [existingAlerts] = await pool.execute(
        `SELECT id FROM alertas 
         WHERE indicador_id = ? 
         AND tipo_alerta = 'Valor Atipico' 
         AND fecha_generada >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
        [anomaly.indicador_id],
      )

      if (existingAlerts.length === 0) {
        const description = `Valor atípico detectado en ${anomaly.indicador_nombre}: ${anomaly.valor} (promedio histórico: ${anomaly.promedio_historico.toFixed(2)})`

        await pool.execute(
          "INSERT INTO alertas (indicador_id, tipo_alerta, descripcion, valor_umbral) VALUES (?, ?, ?, ?)",
          [anomaly.indicador_id, "Valor Atipico", description, anomaly.promedio_historico],
        )
      }
    }

    console.log(`Detectadas ${anomalies.length} anomalías`)
  } catch (error) {
    console.error("Error en detección de anomalías:", error)
  }
}

module.exports = {
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  createAlert,
  detectAnomalousValues,
}
