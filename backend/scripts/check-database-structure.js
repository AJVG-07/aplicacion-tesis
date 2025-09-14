const { pool } = require('../config/database');

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...');
  
  try {
    // Obtener todas las tablas
    const [tables] = await pool.execute("SHOW TABLES");
    console.log('\n📋 Tablas existentes:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // Verificar estructura de cada tabla importante
    const importantTables = ['usuarios', 'indicadores', 'categorias', 'registros', 'asignacion_indicadores'];
    
    for (const tableName of importantTables) {
      try {
        const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
        console.log(`\n🔍 Estructura de la tabla '${tableName}':`);
        columns.forEach(col => {
          const key = col.Key === 'PRI' ? ' (PK)' : col.Key === 'MUL' ? ' (FK)' : '';
          console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${key}`);
        });
      } catch (error) {
        console.log(`\n⚠️  Tabla '${tableName}' no existe`);
      }
    }
    
    // Verificar datos existentes en tablas clave
    console.log('\n📊 Datos existentes:');
    
    try {
      const [userCount] = await pool.execute("SELECT COUNT(*) as count FROM usuarios");
      console.log(`   👥 Usuarios: ${userCount[0].count}`);
    } catch (e) { console.log('   👥 Usuarios: tabla no existe'); }
    
    try {
      const [indicatorCount] = await pool.execute("SELECT COUNT(*) as count FROM indicadores");
      console.log(`   📈 Indicadores: ${indicatorCount[0].count}`);
    } catch (e) { console.log('   📈 Indicadores: tabla no existe'); }
    
    try {
      const [categoryCount] = await pool.execute("SELECT COUNT(*) as count FROM categorias");
      console.log(`   🏷️  Categorías: ${categoryCount[0].count}`);
    } catch (e) { console.log('   🏷️  Categorías: tabla no existe'); }
    
  } catch (error) {
    console.error('❌ Error al verificar estructura:', error);
    throw error;
  }
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  checkDatabaseStructure()
    .then(() => {
      console.log('\n🏁 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la verificación:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStructure };