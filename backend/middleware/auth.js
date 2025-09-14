const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Verificar que el usuario existe y está activo
    const [users] = await pool.execute(
      'SELECT id, nombre, apellido, email, rol, estado FROM usuarios WHERE id = ? AND estado = "activo"',
      [decoded.userId],
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario no válido o inactivo",
      })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token inválido",
    })
  }
}

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== "administrador") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador",
    })
  }
  next()
}

// Middleware para verificar rol de encargado o administrador
const requireEncargadoOrAdmin = (req, res, next) => {
  if (req.user.rol !== "encargado" && req.user.rol !== "administrador") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de encargado o administrador",
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEncargadoOrAdmin,
  JWT_SECRET,
}
