const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireEncargadoOrAdmin } = require("../middleware/auth")
const {
  getUserRecords,
  createOrUpdateRecord,
  getAssignedIndicatorsWithStatus,
} = require("../controllers/recordController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)
router.use(requireEncargadoOrAdmin)

// Obtener registros del usuario
router.get("/", getUserRecords)

// Obtener indicadores asignados con estado de carga
router.get("/indicators-status", getAssignedIndicatorsWithStatus)

// Crear o actualizar registro
router.post(
  "/",
  [
    body("indicador_id").isInt({ min: 1 }),
    body("mes").isInt({ min: 1, max: 12 }),
    body("anio").isInt({ min: 2020 }),
    body("valor").isNumeric({ min: 0 }),
  ],
  createOrUpdateRecord,
)

module.exports = router
