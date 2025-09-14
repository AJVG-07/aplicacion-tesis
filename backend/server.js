const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cron = require("node-cron")
require("dotenv").config()

const { testConnection } = require("./config/database")
const { detectAnomalousValues } = require("./controllers/alertsController")
const { runAutoZeroDataJobIfNeeded } = require("./jobs/autoZeroDataJob")

// Importar rutas
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const indicatorRoutes = require("./routes/indicators")
const recordRoutes = require("./routes/records")
const analyticsRoutes = require("./routes/analytics")
const reportsRoutes = require("./routes/reports")
const alertsRoutes = require("./routes/alerts")
const metasRoutes = require("./routes/metas")
const dataEntryRoutes = require("./routes/dataEntry")

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de seguridad
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
})
app.use(limiter)

// Middlewares básicos
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/indicators", indicatorRoutes)
app.use("/api/records", recordRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/reports", reportsRoutes)
app.use("/api/alerts", alertsRoutes)
app.use("/api/metas", metasRoutes)
app.use("/api/data-entry", dataEntryRoutes)

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
  })
})

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
})

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
})

// Tareas programadas
// Ejecutar detección de anomalías diariamente a las 2 AM
cron.schedule("0 2 * * *", () => {
  console.log("Ejecutando detección de valores atípicos...")
  detectAnomalousValues()
})

// Ejecutar carga automática de ceros diariamente a las 3 AM (solo se ejecuta el día 6)
cron.schedule("0 3 * * *", async () => {
  console.log("Verificando si debe ejecutarse la carga automática de ceros...")
  try {
    await runAutoZeroDataJobIfNeeded()
  } catch (error) {
    console.error("Error en tarea programada de carga automática:", error)
  }
})

// Iniciar servidor
const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
      console.log(`📊 API disponible en http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()
