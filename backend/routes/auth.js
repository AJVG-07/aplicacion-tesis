const express = require("express")
const { body } = require("express-validator")
const { authenticateToken } = require("../middleware/auth")
const { login, register, changePassword, requestPasswordReset } = require("../controllers/authController")

const router = express.Router()

// Login
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 1 })], login)

// Registro público
router.post("/register", [
  body("nombre").trim().isLength({ min: 1 }).withMessage("Nombre es requerido"),
  body("apellido").trim().isLength({ min: 1 }).withMessage("Apellido es requerido"),
  body("email").isEmail().normalizeEmail().withMessage("Email válido es requerido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
], register)

// Cambiar contraseña
router.post(
  "/change-password",
  authenticateToken,
  [body("currentPassword").isLength({ min: 1 }), body("newPassword").isLength({ min: 6 })],
  changePassword,
)

// Solicitar recuperación de contraseña
router.post("/request-password-reset", [body("email").isEmail().normalizeEmail()], requestPasswordReset)

module.exports = router
