const express = require("express")
const { authenticateToken, requireEncargadoOrAdmin } = require("../middleware/auth")
const {
  getIndicatorAnalytics,
  getCategoryAnalytics,
  getMonthlyComparison,
  getTrendsAndAlerts,
} = require("../controllers/analyticsController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)
router.use(requireEncargadoOrAdmin)

// Obtener analytics de un indicador específico
router.get("/indicator/:indicatorId", getIndicatorAnalytics)

// Obtener resumen por categorías
router.get("/categories", getCategoryAnalytics)

// Obtener comparación mensual
router.get("/monthly-comparison", getMonthlyComparison)

// Obtener tendencias y alertas
router.get("/trends-alerts", getTrendsAndAlerts)

module.exports = router
