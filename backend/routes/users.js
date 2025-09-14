const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const { getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/userController")

const router = express.Router()

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken)
router.use(requireAdmin)

// Obtener todos los usuarios
router.get("/", getAllUsers)

// Crear nuevo usuario
router.post(
  "/",
  [
    body("nombre").trim().isLength({ min: 1 }),
    body("apellido").trim().isLength({ min: 1 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("rol").isIn(["administrador", "encargado"]),
  ],
  createUser,
)

// Actualizar usuario
router.put(
  "/:id",
  [
    body("nombre").trim().isLength({ min: 1 }),
    body("apellido").trim().isLength({ min: 1 }),
    body("email").isEmail().normalizeEmail(),
    body("rol").isIn(["administrador", "encargado"]),
    body("estado").isIn(["activo", "inactivo"]),
  ],
  updateUser,
)

// Eliminar usuario
router.delete("/:id", deleteUser)

module.exports = router
