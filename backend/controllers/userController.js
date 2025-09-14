const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
            SELECT 
                u.id, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.rol, 
                u.estado, 
                u.fecha_creacion,
                i.id as indicador_id,
                i.nombre as indicador_nombre,
                c.nombre as categoria_nombre
            FROM usuarios u
            LEFT JOIN asignacion_indicadores ai ON u.id = ai.usuario_id
            LEFT JOIN indicadores i ON ai.indicador_id = i.id
            LEFT JOIN categorias c ON i.categoria_id = c.id
            WHERE u.rol != 'administrador'
            ORDER BY u.fecha_creacion DESC
        `)

    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Crear nuevo usuario (solo admin)
const createUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, indicador_id } = req.body

    // Validaciones
    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      })
    }

    if (!["administrador", "encargado"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "Rol inválido",
      })
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute("SELECT id FROM usuarios WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      })
    }

    // Hash de la contraseña
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const [result] = await pool.execute(
      "INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido, email, passwordHash, rol],
    )

    const userId = result.insertId

    // Asignar indicador si es encargado (solo uno)
    if (rol === "encargado" && indicador_id) {
      await pool.execute("INSERT INTO asignacion_indicadores (usuario_id, indicador_id) VALUES (?, ?)", [
        userId,
        indicador_id,
      ])
    }

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        id: userId,
        nombre,
        apellido,
        email,
        rol,
      },
    })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Actualizar usuario (solo admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, email, rol, estado, indicador_id } = req.body

    // Verificar que el usuario existe
    const [existingUsers] = await pool.execute("SELECT id FROM usuarios WHERE id = ?", [id])

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Actualizar datos básicos del usuario
    await pool.execute("UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ?, estado = ? WHERE id = ?", [
      nombre,
      apellido,
      email,
      rol,
      estado,
      id,
    ])

    // Actualizar asignación de indicador si es encargado (solo uno)
    if (rol === "encargado") {
      // Eliminar asignación existente
      await pool.execute("DELETE FROM asignacion_indicadores WHERE usuario_id = ?", [id])

      // Crear nueva asignación si se proporciona
      if (indicador_id) {
        await pool.execute("INSERT INTO asignacion_indicadores (usuario_id, indicador_id) VALUES (?, ?)", [
          id,
          indicador_id,
        ])
      }
    }

    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Eliminar usuario (solo admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que el usuario existe y no es administrador
    const [users] = await pool.execute("SELECT rol FROM usuarios WHERE id = ?", [id])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    if (users[0].rol === "administrador") {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un usuario administrador",
      })
    }

    // Eliminar usuario (las asignaciones se eliminan automáticamente por CASCADE)
    await pool.execute("DELETE FROM usuarios WHERE id = ?", [id])

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
}
