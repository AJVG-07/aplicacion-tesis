const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const { 
  getAllMetas, 
  getMetaById, 
  createMeta, 
  updateMeta, 
  deleteMeta,
  getMetasProgress 
} = require("../controllers/metasController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Obtener progreso de metas (disponible para todos los usuarios autenticados)
router.get("/progress", getMetasProgress)

// Obtener todas las metas
router.get("/", getAllMetas)

// Obtener meta específica
router.get("/:id", getMetaById)

// Las siguientes rutas requieren permisos de administrador
router.use(requireAdmin)

// Crear nueva meta
router.post("/", [
  body("indicador_id").isInt({ min: 1 }).withMessage("Indicador ID debe ser un número válido"),
  body("titulo").trim().isLength({ min: 3, max: 255 }).withMessage("Título debe tener entre 3 y 255 caracteres"),
  body("descripcion").optional().trim().isLength({ max: 1000 }).withMessage("Descripción no debe exceder 1000 caracteres"),
  body("objetivo_numerico").isFloat({ min: 0.01 }).withMessage("Objetivo numérico debe ser mayor que 0"),
  body("fecha_limite").isISO8601().toDate().withMessage("Fecha límite debe ser una fecha válida")
], createMeta)

// Actualizar meta
router.put("/:id", [
  body("indicador_id").optional().isInt({ min: 1 }).withMessage("Indicador ID debe ser un número válido"),
  body("titulo").optional().trim().isLength({ min: 3, max: 255 }).withMessage("Título debe tener entre 3 y 255 caracteres"),
  body("descripcion").optional().trim().isLength({ max: 1000 }).withMessage("Descripción no debe exceder 1000 caracteres"),
  body("objetivo_numerico").optional().isFloat({ min: 0.01 }).withMessage("Objetivo numérico debe ser mayor que 0"),
  body("fecha_limite").optional().isISO8601().toDate().withMessage("Fecha límite debe ser una fecha válida"),
  body("estado").optional().isIn(['en_progreso', 'cumplida', 'atrasada', 'cancelada']).withMessage("Estado debe ser válido")
], updateMeta)

// Eliminar meta
router.delete("/:id", deleteMeta)

module.exports = router