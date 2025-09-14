const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { pool } = require("../config/database")
const { JWT_SECRET } = require("../middleware/auth")

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      })
    }

    // Buscar usuario por email
    const [users] = await pool.execute(
      "SELECT id, nombre, apellido, email, contrasena_hash, rol, estado FROM usuarios WHERE email = ?",
      [email],
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    const user = users[0]

    if (user.estado !== "activo") {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.contrasena_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: "24h" })

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
        },
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva contraseña son requeridas",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      })
    }

    // Obtener contraseña actual del usuario
    const [users] = await pool.execute("SELECT contrasena_hash FROM usuarios WHERE id = ?", [userId])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].contrasena_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      })
    }

    // Hash de la nueva contraseña
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Actualizar contraseña en la base de datos
    await pool.execute("UPDATE usuarios SET contrasena_hash = ? WHERE id = ?", [newPasswordHash, userId])

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Solicitar recuperación de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email es requerido",
      })
    }

    // Verificar si el usuario existe
    const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ? AND estado = "activo"', [email])

    if (users.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: "Si el email existe, recibirás un enlace de recuperación",
      })
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiration = new Date(Date.now() + 3600000) // 1 hora

    // Guardar token en la base de datos
    await pool.execute("UPDATE usuarios SET token_recuperacion = ?, expiracion_token = ? WHERE id = ?", [
      resetToken,
      expiration,
      users[0].id,
    ])

    // Aquí deberías enviar el email con el token
    // Por ahora solo devolvemos el token para testing
    res.json({
      success: true,
      message: "Si el email existe, recibirás un enlace de recuperación",
      resetToken: resetToken, // Solo para desarrollo, remover en producción
    })
  } catch (error) {
    console.error("Error en solicitud de recuperación:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Registro de nuevo usuario (público)
const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body

    // Validaciones
    if (!nombre || !apellido || !email || !password) {
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

    // Crear usuario con rol 'encargado' por defecto
    const [result] = await pool.execute(
      "INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol, estado) VALUES (?, ?, ?, ?, 'encargado', 'activo')",
      [nombre, apellido, email, passwordHash],
    )

    const userId = result.insertId

    // Generar token JWT para login automático
    const token = jwt.sign({ userId, email, rol: 'encargado' }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        token,
        user: {
          id: userId,
          nombre,
          apellido,
          email,
          rol: 'encargado',
        },
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

module.exports = {
  login,
  register,
  changePassword,
  requestPasswordReset,
}
