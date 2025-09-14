const { pool } = require('../config/database');

async function updateIndicatorsTable() {
  console.log('🔧 Actualizando estructura de la tabla indicadores...');
  
  try {
    // Ver estructura actual
    console.log('📋 Estructura actual de la tabla:');
    const [columns] = await pool.execute("DESCRIBE indicadores");
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Actualizar la tabla para que tenga todas las columnas necesarias
    await pool.execute(`
      ALTER TABLE indicadores 
      ADD COLUMN IF NOT EXISTS unidad VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS formula TEXT NULL
    `);
    
    console.log('✅ Estructura de tabla actualizada');
    
    // Ver estructura actualizada
    console.log('\n📋 Nueva estructura de la tabla:');
    const [newColumns] = await pool.execute("DESCRIBE indicadores");
    newColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar tabla:', error);
    throw error;
  }
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  updateIndicatorsTable()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la actualización:', error);
      process.exit(1);
    });
}

module.exports = { updateIndicatorsTable };