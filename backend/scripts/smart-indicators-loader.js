const { pool } = require('../config/database');

async function smartIndicatorsLoader() {
  console.log('🧠 Carga inteligente de indicadores ambientales...');
  
  try {
    // Verificar y adaptar estructura
    await verifyAndAdaptStructure();
    
    // Cargar datos
    await loadAllData();
    
    console.log('🎉 Indicadores cargados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al cargar indicadores:', error);
    throw error;
  }
}

async function verifyAndAdaptStructure() {
  console.log('🔍 Verificando estructura de tablas...');
  
  // Verificar estructura de unidades
  const [unidadesColumns] = await pool.execute("DESCRIBE unidades");
  console.log('📏 Tabla unidades:');
  unidadesColumns.forEach(col => console.log(`   ${col.Field}: ${col.Type}`));
  
  // Verificar estructura de tipos_calculo
  const [tiposColumns] = await pool.execute("DESCRIBE tipos_calculo");
  console.log('🔢 Tabla tipos_calculo:');
  tiposColumns.forEach(col => console.log(`   ${col.Field}: ${col.Type}`));
  
  // Adaptar estructura si es necesario
  const unidadesHasNombre = unidadesColumns.some(col => col.Field === 'nombre');
  const tiposHasDescripcion = tiposColumns.some(col => col.Field === 'descripcion');
  
  if (!unidadesHasNombre) {
    console.log('⚠️  Añadiendo columna nombre a tabla unidades...');
    await pool.execute("ALTER TABLE unidades ADD COLUMN nombre VARCHAR(100) NULL");
  }
  
  if (!tiposHasDescripcion) {
    console.log('⚠️  Añadiendo columna descripcion a tabla tipos_calculo...');
    await pool.execute("ALTER TABLE tipos_calculo ADD COLUMN descripcion TEXT NULL");
  }
  
  console.log('✅ Estructura verificada/adaptada');
}

async function loadAllData() {
  // Cargar unidades
  await loadUnits();
  
  // Cargar tipos de cálculo
  await loadCalculationTypes();
  
  // Verificar categorías
  await verifyCategories();
  
  // Cargar indicadores
  await loadIndicators();
}

async function loadUnits() {
  console.log('📏 Cargando unidades...');
  
  const units = [
    { simbolo: 'kg', nombre: 'Kilogramos' },
    { simbolo: 'kg/persona', nombre: 'Kilogramos por persona' },
    { simbolo: 'kg/m²', nombre: 'Kilogramos por metro cuadrado' },
    { simbolo: '%', nombre: 'Porcentaje' },
    { simbolo: 'L', nombre: 'Litros' },
    { simbolo: 'L/persona', nombre: 'Litros por persona' },
    { simbolo: 'L/m²', nombre: 'Litros por metro cuadrado' },
    { simbolo: 'kWh', nombre: 'Kilovatios-hora' },
    { simbolo: 'kWh/persona', nombre: 'Kilovatios-hora por persona' },
    { simbolo: 'kWh/m²', nombre: 'Kilovatios-hora por metro cuadrado' },
    { simbolo: 'm³', nombre: 'Metros cúbicos' },
    { simbolo: 'tCO₂eq', nombre: 'Toneladas de CO₂ equivalente' },
    { simbolo: 'kgCO₂eq/persona', nombre: 'Kilogramos de CO₂ equivalente por persona' },
    { simbolo: 'm²', nombre: 'Metros cuadrados' },
    { simbolo: 'm²/persona', nombre: 'Metros cuadrados por persona' },
    { simbolo: 'unidades', nombre: 'Unidades' },
    { simbolo: '$', nombre: 'Dólares' }
  ];
  
  for (const unit of units) {
    try {
      // Verificar si existe
      const [existing] = await pool.execute("SELECT id FROM unidades WHERE simbolo = ?", [unit.simbolo]);
      
      if (existing.length === 0) {
        // Determinar qué columnas usar basado en la estructura
        const [columns] = await pool.execute("DESCRIBE unidades");
        const hasNombre = columns.some(col => col.Field === 'nombre');
        
        if (hasNombre) {
          await pool.execute("INSERT INTO unidades (simbolo, nombre) VALUES (?, ?)", [unit.simbolo, unit.nombre]);
        } else {
          await pool.execute("INSERT INTO unidades (simbolo) VALUES (?)", [unit.simbolo]);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error con unidad ${unit.simbolo}:`, error.message);
    }
  }
  
  console.log('✅ Unidades procesadas');
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
    try {
      // Verificar si existe
      const [existing] = await pool.execute("SELECT id FROM tipos_calculo WHERE nombre = ?", [type.nombre]);
      
      if (existing.length === 0) {
        // Determinar qué columnas usar
        const [columns] = await pool.execute("DESCRIBE tipos_calculo");
        const hasDescripcion = columns.some(col => col.Field === 'descripcion');
        
        if (hasDescripcion) {
          await pool.execute("INSERT INTO tipos_calculo (nombre, descripcion) VALUES (?, ?)", [type.nombre, type.descripcion]);
        } else {
          await pool.execute("INSERT INTO tipos_calculo (nombre) VALUES (?)", [type.nombre]);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error con tipo ${type.nombre}:`, error.message);
    }
  }
  
  console.log('✅ Tipos de cálculo procesados');
}

async function verifyCategories() {
  console.log('🏷️  Verificando categorías...');
  
  const categories = [
    'Residuos',
    'Agua', 
    'Energía',
    'Aire y Emisiones',
    'Biodiversidad y Espacios Verdes',
    'Gestión y Educación Ambiental'
  ];
  
  for (const category of categories) {
    await pool.execute("INSERT IGNORE INTO categorias (nombre) VALUES (?)", [category]);
  }
  
  console.log('✅ Categorías verificadas');
}

async function loadIndicators() {
  console.log('📊 Cargando indicadores ambientales...');
  
  const indicators = [
    // RESIDUOS
    { nombre: 'Generación total de residuos', descripcion: 'Peso total de los residuos generados en un período', categoria: 'Residuos', unidad: 'kg', tipo: 'directo', formula: null },
    { nombre: 'Generación de residuos por persona', descripcion: 'Peso de los residuos generados por cada individuo (estudiante, docente o personal)', categoria: 'Residuos', unidad: 'kg/persona', tipo: 'calculado', formula: 'Generación total de residuos / Número de personas' },
    { nombre: 'Generación de residuos por metro cuadrado', descripcion: 'Peso de los residuos por el área de la institución', categoria: 'Residuos', unidad: 'kg/m²', tipo: 'calculado', formula: 'Generación total de residuos / Área total (m²)' },
    { nombre: 'Porcentaje de reciclaje', descripcion: 'Proporción de residuos que se separan para reciclaje', categoria: 'Residuos', unidad: '%', tipo: 'porcentaje', formula: '(Residuos reciclados / Generación total de residuos) × 100' },
    { nombre: 'Peso de residuos electrónicos desechados', descripcion: 'Peso de computadoras, impresoras, monitores y otros equipos electrónicos', categoria: 'Residuos', unidad: 'kg', tipo: 'directo', formula: null },
    { nombre: 'Porcentaje de compostaje de residuos orgánicos', descripcion: 'Proporción de materia orgánica (restos de alimentos, jardinería) que se desvía a compostaje', categoria: 'Residuos', unidad: '%', tipo: 'porcentaje', formula: '(Residuos orgánicos compostados / Total de residuos orgánicos) × 100' },
    
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
    { nombre: 'Porcentaje de energía renovable', descripcion: 'Proporción de la energía que proviene de fuentes limpias (ej. paneles solares)', categoria: 'Energía', unidad: '%', tipo: 'porcentaje', formula: '(Energía renovable / Consumo total de energía) × 100' },
    { nombre: 'Ahorro de energía en periodos no lectivos', descripcion: 'Medida de la reducción del consumo durante vacaciones o fines de semana', categoria: 'Energía', unidad: '%', tipo: 'porcentaje', formula: '((Consumo periodo lectivo - Consumo periodo no lectivo) / Consumo periodo lectivo) × 100' },
    
    // AIRE Y EMISIONES
    { nombre: 'Emisiones de gases de efecto invernadero (GEI)', descripcion: 'Cantidad total de gases de efecto invernadero emitidos. Es la huella de carbono de la institución', categoria: 'Aire y Emisiones', unidad: 'tCO₂eq', tipo: 'directo', formula: null },
    { nombre: 'Emisiones de GEI por persona', descripcion: 'Huella de carbono per cápita de la comunidad educativa', categoria: 'Aire y Emisiones', unidad: 'kgCO₂eq/persona', tipo: 'calculado', formula: 'Emisiones totales de GEI / Número de personas' },
    { nombre: 'Consumo de combustible por la flota de vehículos', descripcion: 'Volumen de combustible (gasolina, diésel) utilizado por los vehículos de la institución (buses, camiones, etc.)', categoria: 'Aire y Emisiones', unidad: 'L', tipo: 'directo', formula: null },
    { nombre: 'Número de viajes en transporte sostenible', descripcion: 'Conteo de viajes realizados en autobús, bicicleta o a pie, medido a través de encuestas', categoria: 'Aire y Emisiones', unidad: 'unidades', tipo: 'directo', formula: null },
    
    // BIODIVERSIDAD Y ESPACIOS VERDES
    { nombre: 'Área de zonas verdes', descripcion: 'Superficie total de jardines, campos deportivos y áreas naturales en el campus', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'm²', tipo: 'directo', formula: null },
    { nombre: 'Área de zonas verdes por persona', descripcion: 'Espacio verde disponible para cada individuo', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'm²/persona', tipo: 'calculado', formula: 'Área total de zonas verdes / Número de personas' },
    { nombre: 'Número de especies de flora nativa', descripcion: 'Conteo de las plantas endémicas de la región presentes en el campus', categoria: 'Biodiversidad y Espacios Verdes', unidad: 'unidades', tipo: 'directo', formula: null },
    
    // GESTIÓN Y EDUCACIÓN AMBIENTAL
    { nombre: 'Gasto en materiales sostenibles', descripcion: 'Inversión monetaria en productos con certificaciones ecológicas o de bajo impacto ambiental', categoria: 'Gestión y Educación Ambiental', unidad: '$', tipo: 'directo', formula: null },
    { nombre: 'Número de iniciativas ambientales', descripcion: 'Conteo de proyectos, programas o campañas de sostenibilidad organizadas', categoria: 'Gestión y Educación Ambiental', unidad: 'unidades', tipo: 'directo', formula: null },
    { nombre: 'Porcentaje de estudiantes/personal que han recibido formación ambiental', descripcion: 'Proporción de la comunidad que ha participado en talleres o cursos sobre sostenibilidad', categoria: 'Gestión y Educación Ambiental', unidad: '%', tipo: 'porcentaje', formula: '(Personas con formación ambiental / Total de personas) × 100' },
    { nombre: 'Número de asignaturas con enfoque ambiental', descripcion: 'Conteo de los cursos o materias en el plan de estudios que abordan la sostenibilidad', categoria: 'Gestión y Educación Ambiental', unidad: 'unidades', tipo: 'directo', formula: null }
  ];
  
  // Limpiar indicadores existentes
  await pool.execute("DELETE FROM indicadores");
  console.log('🗑️  Indicadores anteriores eliminados');
  
  let insertedCount = 0;
  
  for (const indicator of indicators) {
    try {
      const [categoria] = await pool.execute("SELECT id FROM categorias WHERE nombre = ?", [indicator.categoria]);
      const [unidad] = await pool.execute("SELECT id FROM unidades WHERE simbolo = ?", [indicator.unidad]);
      const [tipo] = await pool.execute("SELECT id FROM tipos_calculo WHERE nombre = ?", [indicator.tipo]);
      
      if (categoria.length > 0 && unidad.length > 0 && tipo.length > 0) {
        await pool.execute(
          "INSERT INTO indicadores (nombre, descripcion, categoria_id, unidad_id, tipo_calculo_id, formula) VALUES (?, ?, ?, ?, ?, ?)",
          [indicator.nombre, indicator.descripcion, categoria[0].id, unidad[0].id, tipo[0].id, indicator.formula]
        );
        insertedCount++;
      } else {
        console.log(`⚠️  No se pudo insertar: ${indicator.nombre}`);
        if (categoria.length === 0) console.log(`   - Categoría '${indicator.categoria}' no encontrada`);
        if (unidad.length === 0) console.log(`   - Unidad '${indicator.unidad}' no encontrada`);
        if (tipo.length === 0) console.log(`   - Tipo '${indicator.tipo}' no encontrado`);
      }
    } catch (error) {
      console.log(`❌ Error insertando ${indicator.nombre}:`, error.message);
    }
  }
  
  console.log(`✅ ${insertedCount} indicadores cargados exitosamente`);
  
  // Mostrar resumen
  await showSummary();
}

async function showSummary() {
  const [categories] = await pool.execute(`
    SELECT c.nombre, COUNT(i.id) as cantidad 
    FROM categorias c
    LEFT JOIN indicadores i ON c.id = i.categoria_id
    GROUP BY c.id, c.nombre
    ORDER BY c.nombre
  `);
  
  console.log('\n📈 Resumen de indicadores por categoría:');
  const categoryEmojis = {
    'Residuos': '🌎',
    'Agua': '💧',
    'Energía': '⚡️',
    'Aire y Emisiones': '💨',
    'Biodiversidad y Espacios Verdes': '🌳',
    'Gestión y Educación Ambiental': '🏢'
  };
  
  let total = 0;
  categories.forEach(cat => {
    const emoji = categoryEmojis[cat.nombre] || '📊';
    console.log(`   ${emoji} ${cat.nombre}: ${cat.cantidad} indicadores`);
    total += cat.cantidad;
  });
  
  console.log(`\n🎯 Total: ${total} indicadores ambientales`);
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  smartIndicatorsLoader()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la carga:', error);
      process.exit(1);
    });
}

module.exports = { smartIndicatorsLoader };