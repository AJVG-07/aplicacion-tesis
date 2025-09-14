const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireEncargadoOrAdmin, requireAdmin } = require("../middleware/auth")
const { getUserAlerts, markAlertAsRead, markAllAlertsAsRead, createAlert } = require("../controllers/alertsController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)
router.use(requireEncargadoOrAdmin)

// Obtener alertas del usuario
router.get("/", getUserAlerts)

// Marcar alerta como leída
router.patch("/:alertId/read", markAlertAsRead)

// Marcar todas las alertas como leídas
router.patch("/read-all", markAllAlertsAsRead)

// Crear nueva alerta (solo admin)
router.post(
  "/",
  requireAdmin,
  [
    body("indicador_id").isInt({ min: 1 }),
    body("tipo_alerta").isIn(["Valor Atipico", "Recordatorio", "Incumplimiento Meta"]),
    body("descripcion").isLength({ min: 1 }),
    body("valor_umbral").optional().isNumeric(),
  ],
  createAlert,
)

module.exports = router
