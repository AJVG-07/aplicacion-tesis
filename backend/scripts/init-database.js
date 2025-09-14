const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function initializeDatabase() {
  console.log('🔧 Inicializando base de datos...');
  
  try {
    // Crear tabla usuarios si no existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          contrasena_hash VARCHAR(255) NOT NULL,
          rol ENUM('administrador', 'encargado') NOT NULL DEFAULT 'encargado',
          estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          token_recuperacion VARCHAR(255) NULL,
          expiracion_token TIMESTAMP NULL
      )
    `);
    console.log('✅ Tabla usuarios creada/verificada');

    // Crear tabla indicadores si no existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS indicadores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          unidad VARCHAR(50),
          categoria VARCHAR(100),
          estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla indicadores creada/verificada');

    // Crear tabla asignacion_indicadores si no existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS asignacion_indicadores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          indicador_id INT NOT NULL,
          fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE,
          UNIQUE KEY unique_assignment (usuario_id, indicador_id)
      )
    `);
    console.log('✅ Tabla asignacion_indicadores creada/verificada');

    // Verificar si ya existe un administrador
    const [adminUsers] = await pool.execute(
      "SELECT id FROM usuarios WHERE rol = 'administrador' LIMIT 1"
    );

    if (adminUsers.length === 0) {
      // Crear usuario administrador por defecto
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await pool.execute(
        "INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol) VALUES (?, ?, ?, ?, ?)",
        ['Admin', 'Sistema', 'admin@sistema.com', passwordHash, 'administrador']
      );
      
      console.log('✅ Usuario administrador creado:');
      console.log('   📧 Email: admin@sistema.com');
      console.log('   🔐 Contraseña: admin123');
    } else {
      console.log('✅ Usuario administrador ya existe');
    }

    // Insertar indicadores de ejemplo si la tabla está vacía
    const [existingIndicators] = await pool.execute("SELECT COUNT(*) as count FROM indicadores");
    
    if (existingIndicators[0].count === 0) {
      const sampleIndicators = [
        ['Calidad del Aire', 'Medición de PM2.5 en el ambiente', 'μg/m³', 'Aire'],
        ['Calidad del Agua', 'Medición de pH y contaminantes en agua', 'pH', 'Agua'],
        ['Ruido Ambiental', 'Medición de decibeles en zonas urbanas', 'dB', 'Ruido'],
        ['Temperatura Ambiental', 'Monitoreo de temperatura atmosférica', '°C', 'Clima'],
        ['Humedad Relativa', 'Porcentaje de humedad en el ambiente', '%', 'Clima']
      ];

      for (const indicator of sampleIndicators) {
        await pool.execute(
          "INSERT INTO indicadores (nombre, descripcion, unidad, categoria) VALUES (?, ?, ?, ?)",
          indicator
        );
      }
      
      console.log('✅ Indicadores de ejemplo creados');
    } else {
      console.log('✅ Los indicadores ya existen');
    }

    // Mostrar resumen de la base de datos
    const [userCount] = await pool.execute("SELECT COUNT(*) as count FROM usuarios");
    const [indicatorCount] = await pool.execute("SELECT COUNT(*) as count FROM indicadores");
    
    console.log('\n📊 Resumen de la base de datos:');
    console.log(`   👥 Usuarios: ${userCount[0].count}`);
    console.log(`   📈 Indicadores: ${indicatorCount[0].count}`);
    
    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('\n🚀 Ya puedes:');
    console.log('   1. Iniciar el backend: npm start');
    console.log('   2. Acceder como admin: admin@sistema.com / admin123');
    console.log('   3. Registrar nuevos usuarios desde /register');
    console.log('   4. Gestionar usuarios desde el panel de administración');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };