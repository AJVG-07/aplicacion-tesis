const express = require('express');
const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'aplicacion_tesis'
});

// Verificación de la conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err.code);
    return;
  }
  if (connection) {
    console.log('Conexión a la base de datos exitosa.');
    connection.release();
  }
});

app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});