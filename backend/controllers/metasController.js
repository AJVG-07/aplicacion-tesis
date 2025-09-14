const { pool } = require("../config/database")

// Obtener todas las metas
const getAllMetas = async (req, res) => {
  try {
    const [metas] = await pool.execute(`
      SELECT 
        m.id,
        m.titulo,
        m.descripcion,
        m.objetivo_numerico,
        m.fecha_limite,
        m.estado,
        m.fecha_creacion,
        i.nombre as indicador_nombre,
        u.simbolo as unidad,
        c.nombre as categoria,
        -- Calcular progreso basado en el último registro
        COALESCE(r.ultimo_valor, 0) as valor_actual,
        CASE 
          WHEN m.objetivo_numerico > 0 THEN 
            ROUND((COALESCE(r.ultimo_valor, 0) / m.objetivo_numerico) * 100, 2)
          ELSE 0 
        END as progreso_porcentaje,
        -- Determinar estado automático basado en fecha y progreso
        CASE 
          WHEN m.fecha_limite < CURDATE() AND m.estado != 'cumplida' THEN 'atrasada'
          WHEN COALESCE(r.ultimo_valor, 0) >= m.objetivo_numerico THEN 'cumplida'
          ELSE 'en_progreso'
        END as estado_calculado
      FROM metas_ambientales m
      INNER JOIN indicadores i ON m.indicador_id = i.id
      INNER JOIN unidades u ON i.unidad_id = u.id
      INNER JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN (
        SELECT 
          indicador_id,
          valor as ultimo_valor,
          ROW_NUMBER() OVER (PARTITION BY indicador_id ORDER BY fecha_registro DESC) as rn
        FROM registros
      ) r ON i.id = r.indicador_id AND r.rn = 1
      ORDER BY m.fecha_creacion DESC
    `)

    // Actualizar estados automáticamente
    for (const meta of metas) {
      if (meta.estado !== meta.estado_calculado) {
        await pool.execute(
          "UPDATE metas_ambientales SET estado = ? WHERE id = ?",
          [meta.estado_calculado, meta.id]
        )
      }
    }

    res.json({
      success: true,
      data: metas.map(meta => ({
        ...meta,
        estado: meta.estado_calculado
      }))
    })
  } catch (error) {
    console.error("Error al obtener metas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Obtener una meta específica
const getMetaById = async (req, res) => {
  try {
    const { id } = req.params

    const [metas] = await pool.execute(`
      SELECT 
        m.*,
        i.nombre as indicador_nombre,
        u.simbolo as unidad,
        c.nombre as categoria
      FROM metas_ambientales m
      INNER JOIN indicadores i ON m.indicador_id = i.id
      INNER JOIN unidades u ON i.unidad_id = u.id
      INNER JOIN categorias c ON i.categoria_id = c.id
      WHERE m.id = ?
    `, [id])

    if (metas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meta no encontrada"
      })
    }

    res.json({
      success: true,
      data: metas[0]
    })
  } catch (error) {
    console.error("Error al obtener meta:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Crear nueva meta
const createMeta = async (req, res) => {
  try {
    const { indicador_id, titulo, descripcion, objetivo_numerico, fecha_limite } = req.body

    // Validaciones
    if (!indicador_id || !titulo || !objetivo_numerico || !fecha_limite) {
      return res.status(400).json({
        success: false,
        message: "Los campos indicador, título, objetivo y fecha límite son requeridos"
      })
    }

    if (objetivo_numerico <= 0) {
      return res.status(400).json({
        success: false,
        message: "El objetivo numérico debe ser mayor que cero"
      })
    }

    if (new Date(fecha_limite) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "La fecha límite debe ser futura"
      })
    }

    // Verificar que el indicador existe
    const [indicador] = await pool.execute(
      "SELECT id FROM indicadores WHERE id = ?",
      [indicador_id]
    )

    if (indicador.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El indicador especificado no existe"
      })
    }

    // Crear la meta
    const [result] = await pool.execute(
      "INSERT INTO metas_ambientales (indicador_id, titulo, descripcion, objetivo_numerico, fecha_limite) VALUES (?, ?, ?, ?, ?)",
      [indicador_id, titulo, descripcion, objetivo_numerico, fecha_limite]
    )

    res.status(201).json({
      success: true,
      message: "Meta creada exitosamente",
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error("Error al crear meta:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Actualizar meta
const updateMeta = async (req, res) => {
  try {
    const { id } = req.params
    const { indicador_id, titulo, descripcion, objetivo_numerico, fecha_limite, estado } = req.body

    // Verificar que la meta existe
    const [existingMeta] = await pool.execute(
      "SELECT id FROM metas_ambientales WHERE id = ?",
      [id]
    )

    if (existingMeta.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meta no encontrada"
      })
    }

    // Validaciones
    if (objetivo_numerico && objetivo_numerico <= 0) {
      return res.status(400).json({
        success: false,
        message: "El objetivo numérico debe ser mayor que cero"
      })
    }

    if (fecha_limite && new Date(fecha_limite) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "La fecha límite debe ser futura"
      })
    }

    // Actualizar la meta
    await pool.execute(`
      UPDATE metas_ambientales 
      SET indicador_id = COALESCE(?, indicador_id),
          titulo = COALESCE(?, titulo),
          descripcion = COALESCE(?, descripcion),
          objetivo_numerico = COALESCE(?, objetivo_numerico),
          fecha_limite = COALESCE(?, fecha_limite),
          estado = COALESCE(?, estado)
      WHERE id = ?
    `, [indicador_id, titulo, descripcion, objetivo_numerico, fecha_limite, estado, id])

    res.json({
      success: true,
      message: "Meta actualizada exitosamente"
    })
  } catch (error) {
    console.error("Error al actualizar meta:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Eliminar meta
const deleteMeta = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que la meta existe
    const [existingMeta] = await pool.execute(
      "SELECT id FROM metas_ambientales WHERE id = ?",
      [id]
    )

    if (existingMeta.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meta no encontrada"
      })
    }

    // Eliminar la meta
    await pool.execute("DELETE FROM metas_ambientales WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Meta eliminada exitosamente"
    })
  } catch (error) {
    console.error("Error al eliminar meta:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

// Obtener progreso de metas (para dashboard)
const getMetasProgress = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_metas,
        SUM(CASE WHEN estado = 'cumplida' THEN 1 ELSE 0 END) as metas_cumplidas,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as metas_en_progreso,
        SUM(CASE WHEN estado = 'atrasada' THEN 1 ELSE 0 END) as metas_atrasadas,
        AVG(
          CASE 
            WHEN objetivo_numerico > 0 THEN 
              LEAST(100, (COALESCE(r.ultimo_valor, 0) / objetivo_numerico) * 100)
            ELSE 0 
          END
        ) as progreso_promedio
      FROM metas_ambientales m
      LEFT JOIN (
        SELECT 
          indicador_id,
          valor as ultimo_valor,
          ROW_NUMBER() OVER (PARTITION BY indicador_id ORDER BY fecha_registro DESC) as rn
        FROM registros
      ) r ON m.indicador_id = r.indicador_id AND r.rn = 1
    `)

    res.json({
      success: true,
      data: stats[0]
    })
  } catch (error) {
    console.error("Error al obtener progreso de metas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    })
  }
}

module.exports = {
  getAllMetas,
  getMetaById,
  createMeta,
  updateMeta,
  deleteMeta,
  getMetasProgress
}