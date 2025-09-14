const { pool } = require('../config/database');

async function completeDatabaseSetup() {
  console.log('🔧 Configurando base de datos completa...');
  
  try {
    // Crear todas las tablas necesarias
    await createTables();
    await loadCategories();
    await loadUnits();
    await loadCalculationTypes();
    await loadIndicators();
    await createUserIfNotExists();
    
    console.log('🎉 Base de datos configurada completamente!');
    
  } catch (error) {
    console.error('❌ Error en configuración:', error);
    throw error;
  }
}

async function createTables() {
  console.log('📋 Creando/verificando tablas...');
  
  // Tabla de categorías
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE,
      descripcion TEXT,
      color VARCHAR(7) DEFAULT '#6B7280',
      icono VARCHAR(20) DEFAULT '📊',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabla de unidades
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS unidades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      simbolo VARCHAR(20) NOT NULL,
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabla de tipos de cálculo
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tipos_calculo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabla de indicadores (actualizar estructura)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS indicadores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      categoria_id INT NOT NULL,
      unidad_id INT NOT NULL,
      tipo_calculo_id INT NOT NULL,
      formula TEXT,
      estado ENUM('activo', 'inactivo') DEFAULT 'activo',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (unidad_id) REFERENCES unidades(id),
      FOREIGN KEY (tipo_calculo_id) REFERENCES tipos_calculo(id)
    )
  `);
  
  // Tabla de metas ambientales
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS metas_ambientales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      indicador_id INT NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      objetivo_numerico DECIMAL(15,4) NOT NULL,
      fecha_limite DATE NOT NULL,
      estado ENUM('en_progreso', 'cumplida', 'atrasada', 'cancelada') DEFAULT 'en_progreso',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE
    )
  `);
  
  // Tabla de registros de datos
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS registros (
      id INT AUTO_INCREMENT PRIMARY KEY,
      indicador_id INT NOT NULL,
      usuario_id INT NOT NULL,
      valor DECIMAL(15,4) NOT NULL,
      mes INT NOT NULL,
      ano INT NOT NULL,
      estado ENUM('pendiente', 'cargado', 'cargado_con_ceros') DEFAULT 'cargado',
      observaciones TEXT,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_indicator_month_year (indicador_id, mes, ano),
      FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
  
  // Tabla de alertas
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo ENUM('valor_atipico', 'meta_atrasada', 'carga_pendiente', 'sistema') NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      indicador_id INT NULL,
      usuario_id INT NULL,
      estado ENUM('nueva', 'leida', 'resuelta') DEFAULT 'nueva',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_leida TIMESTAMP NULL,
      FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
  
  // Tabla de configuración del sistema
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS configuracion_sistema (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clave VARCHAR(100) NOT NULL UNIQUE,
      valor TEXT NOT NULL,
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Todas las tablas creadas/verificadas');
}

async function loadCategories() {
  console.log('🏷️  Cargando categorías...');
  
  const categories = [
    { nombre: 'Residuos', descripcion: 'Gestión y generación de residuos', color: '#10B981', icono: '🌎' },
    { nombre: 'Agua', descripcion: 'Consumo y gestión del agua', color: '#3B82F6', icono: '💧' },
    { nombre: 'Energía', descripcion: 'Consumo energético y eficiencia', color: '#F59E0B', icono: '⚡️' },
    { nombre: 'Aire y Emisiones', descripcion: 'Calidad del aire y emisiones GEI', color: '#8B5CF6', icono: '💨' },
    { nombre: 'Biodiversidad y Espacios Verdes', descripcion: 'Flora, fauna y áreas verdes', color: '#059669', icono: '🌳' },
    { nombre: 'Gestión y Educación Ambiental', descripcion: 'Programas educativos y gestión', color: '#DC2626', icono: '🏢' }
  ];
  
  for (const cat of categories) {
    await pool.execute(`
      INSERT IGNORE INTO categorias (nombre, descripcion, color, icono) 
      VALUES (?, ?, ?, ?)
    `, [cat.nombre, cat.descripcion, cat.color, cat.icono]);
  }
  
  console.log('✅ Categorías cargadas');
}

async function loadUnits() {
  console.log('📏 Cargando unidades...');
  
  const units = [
    { nombre: 'Kilogramos', simbolo: 'kg' },
    { nombre: 'Kilogramos por persona', simbolo: 'kg/persona' },
    { nombre: 'Kilogramos por metro cuadrado', simbolo: 'kg/m²' },
    { nombre: 'Porcentaje', simbolo: '%' },
    { nombre: 'Litros', simbolo: 'L' },
    { nombre: 'Litros por persona', simbolo: 'L/persona' },
    { nombre: 'Litros por metro cuadrado', simbolo: 'L/m²' },
    { nombre: 'Kilovatios-hora', simbolo: 'kWh' },
    { nombre: 'Kilovatios-hora por persona', simbolo: 'kWh/persona' },
    { nombre: 'Kilovatios-hora por metro cuadrado', simbolo: 'kWh/m²' },
    { nombre: 'Metros cúbicos', simbolo: 'm³' },
    { nombre: 'Toneladas de CO₂ equivalente', simbolo: 'tCO₂eq' },
    { nombre: 'Kilogramos de CO₂ equivalente por persona', simbolo: 'kgCO₂eq/persona' },
    { nombre: 'Metros cuadrados', simbolo: 'm²' },
    { nombre: 'Metros cuadrados por persona', simbolo: 'm²/persona' },
    { nombre: 'Unidades', simbolo: 'unidades' },
    { nombre: 'Dólares', simbolo: '$' }
  ];
  
  for (const unit of units) {
    await pool.execute(`
      INSERT IGNORE INTO unidades (nombre, simbolo) 
      VALUES (?, ?)
    `, [unit.nombre, unit.simbolo]);
  }
  
  console.log('✅ Unidades cargadas');
}

async function loadCalculationTypes() {
  console.log('🔢 Cargando tipos de cálculo...');
  
  const types = [
    { nombre: 'directo', descripcion: 'Valor directo sin cálculo adicional' },
    { nombre: 'calculado', descripcion: 'Valor calculado mediante fórmula' },
    { nombre: 'porcentaje', descripcion: 'Valor en porcentaje' },
    { nombre: 'ratio', descripcion: 'Relación entre dos valores' }
  ];
  
  for (const type of types) {
    await pool.execute(`
      INSERT IGNORE INTO tipos_calculo (nombre, descripcion) 
      VALUES (?, ?)
    `, [type.nombre, type.descripcion]);
  }
  
  console.log('✅ Tipos de cálculo cargados');
}

async function loadIndicators() {
  console.log('📊 Cargando indicadores ambientales...');
  
  const indicators = [
    // RESIDUOS
    { nombre: 'Generación total de residuos', descripcion: 'Peso total de los residuos generados en un período', categoria: 'Residuos', unidad: 'kg', tipo: 'directo', formula: null },
    { nombre: 'Generación de residuos por persona', descripcion: 'Peso de los residuos generados por cada individuo', categoria: 'Residuos', unidad: 'kg/persona', tipo: 'calculado', formula: 'Generación total de residuos / Número de personas' },
    { nombre: 'Generación de residuos por metro cuadrado', descripcion: 'Peso de los residuos por el área de la institución', categoria: 'Residuos', unidad: 'kg/m²', tipo: 'calculado', formula: 'Generación total de residuos / Área total (m²)' },
    { nombre: 'Porcentaje de reciclaje', descripcion: 'Proporción de residuos que se separan para reciclaje', categoria: 'Residuos', unidad: '%', tipo: 'porcentaje', formula: '(Residuos reciclados / Generación total de residuos) × 100' },
    { nombre: 'Peso de residuos electrónicos desechados', descripcion: 'Peso de computadoras, impresoras, monitores y otros equipos electrónicos', categoria: 'Residuos', unidad: 'kg', tipo: 'directo', formula: null },
    { nombre: 'Porcentaje de compostaje de residuos orgánicos', descripcion: 'Proporción de materia orgánica que se desvía a compostaje', categoria: 'Residuos', unidad: '%', tipo: 'porcentaje', formula: '(Residuos orgánicos compostados / Total de residuos orgánicos) × 100' },
    
    // AGUA
    { nombre: 'Consumo total de agua', descripcion: 'Volumen total de agua utilizada por la institución', categoria: 'Agua', unidad: 'L', tipo: 'directo', formula: null },
    { nombre: 'Consumo de agua por persona', descripcion: 'Volumen de agua que consume cada individuo', categoria: 'Agua', unidad: 'L/persona', tipo: 'calculado', formula: 'Consumo total de agua / Número de personas' },
    { nombre: 'Consumo de agua por metro cuadrado', descripcion: 'Volumen de agua por área construida o del campus', categoria: 'Agua', unidad: 'L/m²', tipo: 'calculado', formula: 'Consumo total de agua / Área total (m²)' },
    { nombre: 'Volumen de agua de lluvia recolectada', descripcion: 'Cantidad de agua pluvial que se capta para su reutilización', categoria: 'Agua', unidad: 'L', tipo: 'directo', formula: null },
    { nombre: 'Agua reutilizada o tratada', descripcion: 'Volumen de agua que se recicla para usos como riego o limpieza', categoria: 'Agua', unidad: 'L', tipo: 'directo', formula: null },
    { nombre: 'Número de fugas de agua detectadas y reparadas', descripcion: 'Medida de la eficiencia del mantenimiento de la red de agua', categoria: 'Agua', unidad: 'unidades', tipo: 'directo', formula: null },
    
    // ENERGÍA
    { nombre: 'Consumo total de energía eléctrica', descripcion: 'Energía eléctrica total consumida', categoria: 'Energía', unidad: 'kWh', tipo: 'directo', formula: null },
    { nombre: 'Consumo de energía por persona', descripcion: 'Energía consumida por cada individuo', categoria: 'Energía', unidad: 'kWh/persona', tipo: 'calculado', formula: 'Consumo total de energía / Número de personas' },
    { nombre: 'Consumo de energía por metro cuadrado', descripcion: 'Energía consumida por la superficie total de la institución', categoria: 'Energía', unidad: 'kWh/m²', tipo: 'calculado', formula: 'Consumo total de energía / Área total (m²)' },
    { nombre: 'Consumo de gas natural o GLP', descripcion: 'Volumen de gas utilizado para calefacción o cocinas', categoria: 'Energía', unidad: 'm³', tipo: 'directo', formula: null },
    { nombre: 'Porcentaje de energía renovable', descripcion: 'Proporción de la energía que proviene de fuentes limpias', categoria: 'Energía', unidad: '%', tipo: 'porcentaje', formula: '(Energía renovable / Consumo total de energía) × 100' },
    { nombre: 'Ahorro de energía en periodos no lectivos', descripcion: 'Medida de la reducción del consumo durante vacaciones', categoria: 'Energía', unidad: '%', tipo: 'porcentaje', formula: '((Consumo periodo lectivo - Consumo periodo no lectivo) / Consumo periodo lectivo) × 100' },
    
    // AIRE Y EMISIONES
    { nombre: 'Emisiones de gases de efecto invernadero (GEI)', descripcion: 'Cantidad total de gases de efecto invernadero emitidos', categoria: 'Aire y Emisiones', unidad: 'tCO₂eq', tipo: 'directo', formula: null },
    { nombre: 'Emisiones de GEI por persona', descripcion: 'Huella de carbono per cápita de la comunidad educativa', categoria: 'Aire y Emisiones', unidad: 'kgCO₂eq/persona', tipo: 'calculado', formula: 'Emisiones totales de GEI / Número de personas' },
    { nombre: 'Consumo de combustible por la flota de vehículos', descripcion: 'Volumen de combustible utilizado por los vehículos de la institución', categoria: 'Aire y Emisiones', unidad: 'L', tipo: 'directo', formula: null },
    { nombre: 'Número de viajes en transporte sostenible', descripcion: 'Conteo de viajes realizados en autobús, bicicleta o a pie', categoria: 'Aire y Emisiones', unidad: 'unidades', tipo: 'directo', formula: null },
    
    // BIODIVERSIDAD
    { nombre: 'Área de zonas verdes', descripcion: 'Superficie total de jardines, campos deportivos y áreas naturales', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'm²', tipo: 'directo', formula: null },
    { nombre: 'Área de zonas verdes por persona', descripcion: 'Espacio verde disponible para cada individuo', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'm²/persona', tipo: 'calculado', formula: 'Área total de zonas verdes / Número de personas' },
    { nombre: 'Número de especies de flora nativa', descripcion: 'Conteo de las plantas endémicas de la región presentes', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'unidades', tipo: 'directo', formula: null },
    
    // GESTIÓN Y EDUCACIÓN
    { nombre: 'Gasto en materiales sostenibles', descripcion: 'Inversión en productos con certificaciones ecológicas', categoria: 'Gestión y Educación Ambiental', unidad: '$', tipo: 'directo', formula: null },
    { nombre: 'Número de iniciativas ambientales', descripcion: 'Conteo de proyectos, programas o campañas de sostenibilidad', categoria: 'Gestión y Educación Ambiental', unidad: 'unidades', tipo: 'directo', formula: null },
    { nombre: 'Porcentaje de estudiantes/personal que han recibido formación ambiental', descripcion: 'Proporción de la comunidad que ha participado en talleres', categoria: 'Gestión y Educación Ambiental', unidad: '%', tipo: 'porcentaje', formula: '(Personas con formación ambiental / Total de personas) × 100' },
    { nombre: 'Número de asignaturas con enfoque ambiental', descripcion: 'Conteo de los cursos que abordan la sostenibilidad', categoria: 'Gestión y Educación Ambiental', unidad: 'unidades', tipo: 'directo', formula: null }
  ];
  
  // Limpiar indicadores existentes
  await pool.execute("DELETE FROM indicadores");
  
  for (const indicator of indicators) {
    const [categoria] = await pool.execute("SELECT id FROM categorias WHERE nombre = ?", [indicator.categoria]);
    const [unidad] = await pool.execute("SELECT id FROM unidades WHERE simbolo = ?", [indicator.unidad]);
    const [tipo] = await pool.execute("SELECT id FROM tipos_calculo WHERE nombre = ?", [indicator.tipo]);
    
    if (categoria.length > 0 && unidad.length > 0 && tipo.length > 0) {
      await pool.execute(
        "INSERT INTO indicadores (nombre, descripcion, categoria_id, unidad_id, tipo_calculo_id, formula) VALUES (?, ?, ?, ?, ?, ?)",
        [indicator.nombre, indicator.descripcion, categoria[0].id, unidad[0].id, tipo[0].id, indicator.formula]
      );
    }
  }
  
  console.log('✅ Indicadores cargados');
}

async function createUserIfNotExists() {
  console.log('👤 Verificando usuario administrador...');
  
  const [adminUsers] = await pool.execute("SELECT id FROM usuarios WHERE rol = 'administrador' LIMIT 1");
  
  if (adminUsers.length === 0) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await pool.execute(
      "INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol) VALUES (?, ?, ?, ?, ?)",
      ['Admin', 'Sistema', 'admin@sistema.com', passwordHash, 'administrador']
    );
    
    console.log('✅ Usuario administrador creado: admin@sistema.com / admin123');
  } else {
    console.log('✅ Usuario administrador ya existe');
  }
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  completeDatabaseSetup()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      console.log('\n🚀 Ya puedes:');
      console.log('   1. Iniciar el backend: npm start');
      console.log('   2. Acceder como admin: admin@sistema.com / admin123');
      console.log('   3. Comenzar a cargar datos ambientales');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la configuración:', error);
      process.exit(1);
    });
}

module.exports = { completeDatabaseSetup };