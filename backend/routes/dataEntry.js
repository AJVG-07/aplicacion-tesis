const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const {
  checkDataEntryStatus,
  getDataEntryForm,
  saveDataEntry,
  getDataEntryHistory
} = require("../controllers/dataEntryController")
const { runManualAutoZero } = require("../jobs/autoZeroDataJob")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Verificar estado de carga de datos
router.get("/status", checkDataEntryStatus)

// Obtener formulario de carga (solo encargados)
router.get("/form", getDataEntryForm)

// Guardar datos del formulario (solo encargados)
router.post("/save", [
  body("registros").isArray({ min: 1 }).withMessage("Debe proporcionar al menos un registro"),
  body("registros.*.indicador_id").isInt({ min: 1 }).withMessage("ID de indicador debe ser válido"),
  body("registros.*.valor").isFloat({ min: 0 }).withMessage("Valor debe ser un número positivo"),
  body("registros.*.observaciones").optional().trim().isLength({ max: 500 }).withMessage("Observaciones no deben exceder 500 caracteres")
], saveDataEntry)

// Obtener historial de cargas del usuario
router.get("/history", getDataEntryHistory)

// Ejecutar carga automática de ceros manualmente (solo administradores)
router.post("/auto-zero", requireAdmin, runManualAutoZero)

module.exports = router
