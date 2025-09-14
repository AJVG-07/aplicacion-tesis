const express = require("express")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const {
  getAllIndicators,
  getAssignedIndicators,
  getCategories,
  getCalculationTypes,
  getUnits,
} = require("../controllers/indicatorController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Obtener todos los indicadores (admin) o asignados (encargado)
router.get("/", (req, res, next) => {
  if (req.user.rol === "administrador") {
    getAllIndicators(req, res, next)
  } else {
    getAssignedIndicators(req, res, next)
  }
})

// Obtener categorías
router.get("/categories", getCategories)

// Obtener tipos de cálculo
router.get("/calculation-types", getCalculationTypes)

// Obtener unidades
router.get("/units", getUnits)

module.exports = router
