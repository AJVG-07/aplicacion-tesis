const { pool } = require("../config/database")

// Obtener todos los indicadores
const getAllIndicators = async (req, res) => {
  try {
    const [indicators] = await pool.execute(`
            SELECT 
                i.id,
                i.nombre,
                i.descripcion,
                c.nombre as categoria,
                tc.nombre as tipo_calculo,
                u.simbolo as unidad,
                u.descripcion as unidad_descripcion
            FROM indicadores i
            JOIN categorias c ON i.categoria_id = c.id
            JOIN tipos_calculo tc ON i.tipo_calculo_id = tc.id
            JOIN unidades u ON i.unidad_id = u.id
            ORDER BY c.nombre, i.nombre
        `)

    res.json({
      success: true,
      data: indicators,
    })
  } catch (error) {
    console.error("Error al obtener indicadores:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener indicadores asignados a un encargado
const getAssignedIndicators = async (req, res) => {
  try {
    const userId = req.user.id

    const [indicators] = await pool.execute(
      `
            SELECT 
                i.id,
                i.nombre,
                i.descripcion,
                c.nombre as categoria,
                tc.nombre as tipo_calculo,
                u.simbolo as unidad,
                u.descripcion as unidad_descripcion
            FROM indicadores i
            JOIN asignacion_indicadores ai ON i.id = ai.indicador_id
            JOIN categorias c ON i.categoria_id = c.id
            JOIN tipos_calculo tc ON i.tipo_calculo_id = tc.id
            JOIN unidades u ON i.unidad_id = u.id
            WHERE ai.usuario_id = ?
            ORDER BY c.nombre, i.nombre
        `,
      [userId],
    )

    res.json({
      success: true,
      data: indicators,
    })
  } catch (error) {
    console.error("Error al obtener indicadores asignados:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener categorías
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute("SELECT * FROM categorias ORDER BY nombre")

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener tipos de cálculo
const getCalculationTypes = async (req, res) => {
  try {
    const [types] = await pool.execute("SELECT * FROM tipos_calculo ORDER BY nombre")

    res.json({
      success: true,
      data: types,
    })
  } catch (error) {
    console.error("Error al obtener tipos de cálculo:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener unidades
const getUnits = async (req, res) => {
  try {
    const [units] = await pool.execute("SELECT * FROM unidades ORDER BY simbolo")

    res.json({
      success: true,
      data: units,
    })
  } catch (error) {
    console.error("Error al obtener unidades:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

module.exports = {
  getAllIndicators,
  getAssignedIndicators,
  getCategories,
  getCalculationTypes,
  getUnits,
}
