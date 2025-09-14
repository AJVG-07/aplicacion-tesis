const express = require("express")
const { body } = require("express-validator")
const { authenticateToken, requireEncargadoOrAdmin } = require("../middleware/auth")
const { generatePDFReport, generateExcelReport, getReportPreview } = require("../controllers/reportsController")

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)
router.use(requireEncargadoOrAdmin)

// Vista previa del reporte
router.get("/preview", getReportPreview)

// Generar reporte PDF
router.post("/pdf", [body("indicatorIds").optional().isArray()], generatePDFReport)

// Generar reporte Excel
router.post("/excel", [body("indicatorIds").optional().isArray()], generateExcelReport)

module.exports = router
