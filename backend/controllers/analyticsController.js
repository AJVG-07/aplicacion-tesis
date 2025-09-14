const { pool } = require("../config/database")

// Obtener datos para gráficos de un indicador específico
const getIndicatorAnalytics = async (req, res) => {
  try {
    const { indicatorId } = req.params
    const { year, startMonth, endMonth } = req.query
    const userId = req.user.id

    // Verificar que el usuario tenga acceso al indicador (si es encargado)
    if (req.user.rol === "encargado") {
      const [assignments] = await pool.execute(
        "SELECT id FROM asignacion_indicadores WHERE usuario_id = ? AND indicador_id = ?",
        [userId, indicatorId],
      )

      if (assignments.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver este indicador",
        })
      }
    }

    let query = `
      SELECT 
        rm.mes,
        rm.anio,
        rm.valor,
        rm.estado,
        rm.fecha_carga,
        i.nombre as indicador_nombre,
        u.simbolo as unidad,
        c.nombre as categoria
      FROM registros_mensuales rm
      JOIN indicadores i ON rm.indicador_id = i.id
      JOIN unidades u ON i.unidad_id = u.id
      JOIN categorias c ON i.categoria_id = c.id
      WHERE rm.indicador_id = ?
    `

    const params = [indicatorId]

    if (year) {
      query += " AND rm.anio = ?"
      params.push(year)
    }

    if (startMonth && endMonth) {
      query += " AND rm.mes BETWEEN ? AND ?"
      params.push(startMonth, endMonth)
    }

    query += " ORDER BY rm.anio, rm.mes"

    const [records] = await pool.execute(query, params)

    // Calcular estadísticas
    const values = records.map((r) => r.valor)
    const stats = {
      total: values.length,
      average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      trend: calculateTrend(records),
    }

    res.json({
      success: true,
      data: {
        records,
        stats,
        indicator: records.length > 0 ? records[0] : null,
      },
    })
  } catch (error) {
    console.error("Error al obtener analytics del indicador:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener resumen de todos los indicadores por categoría
const getCategoryAnalytics = async (req, res) => {
  try {
    const { year } = req.query
    const userId = req.user.id

    let query = `
      SELECT 
        c.nombre as categoria,
        i.nombre as indicador_nombre,
        COUNT(rm.id) as total_registros,
        AVG(rm.valor) as promedio,
        MIN(rm.valor) as minimo,
        MAX(rm.valor) as maximo,
        u.simbolo as unidad
      FROM categorias c
      JOIN indicadores i ON c.id = i.categoria_id
      LEFT JOIN registros_mensuales rm ON i.id = rm.indicador_id
      LEFT JOIN unidades u ON i.unidad_id = u.id
    `

    const params = []

    // Si es encargado, filtrar solo sus indicadores asignados
    if (req.user.rol === "encargado") {
      query += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id WHERE ai.usuario_id = ?"
      params.push(userId)
    }

    if (year) {
      const whereClause = req.user.rol === "encargado" ? " AND" : " WHERE"
      query += `${whereClause} rm.anio = ?`
      params.push(year)
    }

    query += " GROUP BY c.id, i.id ORDER BY c.nombre, i.nombre"

    const [results] = await pool.execute(query, params)

    // Agrupar por categoría
    const categoryData = results.reduce((groups, item) => {
      const category = item.categoria
      if (!groups[category]) {
        groups[category] = {
          name: category,
          indicators: [],
          totalRecords: 0,
          averageValue: 0,
        }
      }

      groups[category].indicators.push({
        name: item.indicador_nombre,
        totalRecords: item.total_registros,
        average: item.promedio,
        min: item.minimo,
        max: item.maximo,
        unit: item.unidad,
      })

      groups[category].totalRecords += item.total_registros
      return groups
    }, {})

    res.json({
      success: true,
      data: Object.values(categoryData),
    })
  } catch (error) {
    console.error("Error al obtener analytics por categoría:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener comparación mensual de múltiples indicadores
const getMonthlyComparison = async (req, res) => {
  try {
    const { indicatorIds, year } = req.query
    const userId = req.user.id

    if (!indicatorIds) {
      return res.status(400).json({
        success: false,
        message: "Se requiere al menos un indicador",
      })
    }

    const ids = indicatorIds.split(",").map((id) => Number.parseInt(id))

    // Verificar permisos si es encargado
    if (req.user.rol === "encargado") {
      const placeholders = ids.map(() => "?").join(",")
      const [assignments] = await pool.execute(
        `SELECT indicador_id FROM asignacion_indicadores WHERE usuario_id = ? AND indicador_id IN (${placeholders})`,
        [userId, ...ids],
      )

      const allowedIds = assignments.map((a) => a.indicador_id)
      const unauthorizedIds = ids.filter((id) => !allowedIds.includes(id))

      if (unauthorizedIds.length > 0) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para algunos indicadores solicitados",
        })
      }
    }

    const placeholders = ids.map(() => "?").join(",")
    let query = `
      SELECT 
        rm.mes,
        rm.anio,
        rm.valor,
        i.id as indicador_id,
        i.nombre as indicador_nombre,
        u.simbolo as unidad,
        c.nombre as categoria
      FROM registros_mensuales rm
      JOIN indicadores i ON rm.indicador_id = i.id
      JOIN unidades u ON i.unidad_id = u.id
      JOIN categorias c ON i.categoria_id = c.id
      WHERE rm.indicador_id IN (${placeholders})
    `

    const params = [...ids]

    if (year) {
      query += " AND rm.anio = ?"
      params.push(year)
    }

    query += " ORDER BY rm.anio, rm.mes, i.nombre"

    const [records] = await pool.execute(query, params)

    // Organizar datos por mes
    const monthlyData = {}
    records.forEach((record) => {
      const monthKey = `${record.anio}-${record.mes.toString().padStart(2, "0")}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: record.mes,
          year: record.anio,
          indicators: {},
        }
      }
      monthlyData[monthKey].indicators[record.indicador_id] = {
        name: record.indicador_nombre,
        value: record.valor,
        unit: record.unidad,
        category: record.categoria,
      }
    })

    res.json({
      success: true,
      data: Object.values(monthlyData),
    })
  } catch (error) {
    console.error("Error al obtener comparación mensual:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener tendencias y alertas
const getTrendsAndAlerts = async (req, res) => {
  try {
    const userId = req.user.id

    // Obtener alertas activas
    let alertsQuery = `
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

    const alertsParams = []

    if (req.user.rol === "encargado") {
      alertsQuery += `
        JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
        WHERE ai.usuario_id = ? AND a.leida = FALSE
      `
      alertsParams.push(userId)
    } else {
      alertsQuery += " WHERE a.leida = FALSE"
    }

    alertsQuery += " ORDER BY a.fecha_generada DESC LIMIT 10"

    const [alerts] = await pool.execute(alertsQuery, alertsParams)

    // Obtener indicadores con mayor variación
    let trendsQuery = `
      SELECT 
        i.id,
        i.nombre as indicador_nombre,
        c.nombre as categoria,
        u.simbolo as unidad,
        STDDEV(rm.valor) as variacion,
        AVG(rm.valor) as promedio,
        COUNT(rm.id) as total_registros
      FROM indicadores i
      JOIN categorias c ON i.categoria_id = c.id
      JOIN unidades u ON i.unidad_id = u.id
      JOIN registros_mensuales rm ON i.id = rm.indicador_id
    `

    const trendsParams = []

    if (req.user.rol === "encargado") {
      trendsQuery += " JOIN asignacion_indicadores ai ON i.id = ai.indicador_id WHERE ai.usuario_id = ?"
      trendsParams.push(userId)
    }

    trendsQuery += `
      GROUP BY i.id
      HAVING total_registros >= 3
      ORDER BY variacion DESC
      LIMIT 5
    `

    const [trends] = await pool.execute(trendsQuery, trendsParams)

    res.json({
      success: true,
      data: {
        alerts,
        trends,
      },
    })
  } catch (error) {
    console.error("Error al obtener tendencias y alertas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Función auxiliar para calcular tendencia
const calculateTrend = (records) => {
  if (records.length < 2) return "stable"

  const values = records.map((r) => r.valor)
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  const change = ((secondAvg - firstAvg) / firstAvg) * 100

  if (change > 10) return "increasing"
  if (change < -10) return "decreasing"
  return "stable"
}

module.exports = {
  getIndicatorAnalytics,
  getCategoryAnalytics,
  getMonthlyComparison,
  getTrendsAndAlerts,
}
