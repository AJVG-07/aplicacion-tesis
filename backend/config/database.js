const mysql = require("mysql2/promise")
require("dotenv").config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "aplicacion_tesis",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexión exitosa a la base de datos MySQL")
    connection.release()
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message)
    process.exit(1)
  }
}

module.exports = { pool, testConnection }
