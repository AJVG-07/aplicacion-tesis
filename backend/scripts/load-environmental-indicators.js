const { pool } = require('../config/database');

async function loadEnvironmentalIndicators() {
  console.log('🌱 Cargando indicadores ambientales...');
  
  try {
    // Limpiar indicadores existentes (opcional, comentado por seguridad)
    // await pool.execute("DELETE FROM indicadores");
    
    const indicators = [
      // 🌎 RESIDUOS
      {
        nombre: 'Generación total de residuos',
        descripcion: 'Peso total de los residuos generados en un período',
        unidad: 'kg',
        categoria: 'Residuos',
        formula: null
      },
      {
        nombre: 'Generación de residuos por persona',
        descripcion: 'Peso de los residuos generados por cada individuo (estudiante, docente o personal)',
        unidad: 'kg/persona',
        categoria: 'Residuos',
        formula: 'Generación total de residuos / Número de personas'
      },
      {
        nombre: 'Generación de residuos por metro cuadrado',
        descripcion: 'Peso de los residuos por el área de la institución',
        unidad: 'kg/m²',
        categoria: 'Residuos',
        formula: 'Generación total de residuos / Área total (m²)'
      },
      {
        nombre: 'Porcentaje de reciclaje',
        descripcion: 'Proporción de residuos que se separan para reciclaje',
        unidad: '%',
        categoria: 'Residuos',
        formula: '(Residuos reciclados / Generación total de residuos) × 100'
      },
      {
        nombre: 'Peso de residuos electrónicos desechados',
        descripcion: 'Peso de computadoras, impresoras, monitores y otros equipos electrónicos',
        unidad: 'kg',
        categoria: 'Residuos',
        formula: null
      },
      {
        nombre: 'Porcentaje de compostaje de residuos orgánicos',
        descripcion: 'Proporción de materia orgánica (restos de alimentos, jardinería) que se desvía a compostaje',
        unidad: '%',
        categoria: 'Residuos',
        formula: '(Residuos orgánicos compostados / Total de residuos orgánicos) × 100'
      },
      
      // 💧 AGUA
      {
        nombre: 'Consumo total de agua',
        descripcion: 'Volumen total de agua utilizada por la institución',
        unidad: 'L',
        categoria: 'Agua',
        formula: null
      },
      {
        nombre: 'Consumo de agua por persona',
        descripcion: 'Volumen de agua que consume cada individuo',
        unidad: 'L/persona',
        categoria: 'Agua',
        formula: 'Consumo total de agua / Número de personas'
      },
      {
        nombre: 'Consumo de agua por metro cuadrado',
        descripcion: 'Volumen de agua por área construida o del campus',
        unidad: 'L/m²',
        categoria: 'Agua',
        formula: 'Consumo total de agua / Área total (m²)'
      },
      {
        nombre: 'Volumen de agua de lluvia recolectada',
        descripcion: 'Cantidad de agua pluvial que se capta para su reutilización',
        unidad: 'L',
        categoria: 'Agua',
        formula: null
      },
      {
        nombre: 'Agua reutilizada o tratada',
        descripcion: 'Volumen de agua que se recicla para usos como riego o limpieza',
        unidad: 'L',
        categoria: 'Agua',
        formula: null
      },
      {
        nombre: 'Número de fugas de agua detectadas y reparadas',
        descripcion: 'Medida de la eficiencia del mantenimiento de la red de agua',
        unidad: 'unidades',
        categoria: 'Agua',
        formula: null
      },
      
      // ⚡️ ENERGÍA
      {
        nombre: 'Consumo total de energía eléctrica',
        descripcion: 'Energía eléctrica total consumida',
        unidad: 'kWh',
        categoria: 'Energía',
        formula: null
      },
      {
        nombre: 'Consumo de energía por persona',
        descripcion: 'Energía consumida por cada individuo',
        unidad: 'kWh/persona',
        categoria: 'Energía',
        formula: 'Consumo total de energía / Número de personas'
      },
      {
        nombre: 'Consumo de energía por metro cuadrado',
        descripcion: 'Energía consumida por la superficie total de la institución',
        unidad: 'kWh/m²',
        categoria: 'Energía',
        formula: 'Consumo total de energía / Área total (m²)'
      },
      {
        nombre: 'Consumo de gas natural o GLP',
        descripcion: 'Volumen de gas utilizado para calefacción o cocinas',
        unidad: 'm³',
        categoria: 'Energía',
        formula: null
      },
      {
        nombre: 'Porcentaje de energía renovable',
        descripcion: 'Proporción de la energía que proviene de fuentes limpias (ej. paneles solares)',
        unidad: '%',
        categoria: 'Energía',
        formula: '(Energía renovable / Consumo total de energía) × 100'
      },
      {
        nombre: 'Ahorro de energía en periodos no lectivos',
        descripcion: 'Medida de la reducción del consumo durante vacaciones o fines de semana',
        unidad: '%',
        categoria: 'Energía',
        formula: '((Consumo periodo lectivo - Consumo periodo no lectivo) / Consumo periodo lectivo) × 100'
      },
      
      // 💨 AIRE Y EMISIONES
      {
        nombre: 'Emisiones de gases de efecto invernadero (GEI)',
        descripcion: 'Cantidad total de gases de efecto invernadero emitidos. Huella de carbono de la institución',
        unidad: 'tCO₂eq',
        categoria: 'Aire y Emisiones',
        formula: null
      },
      {
        nombre: 'Emisiones de GEI por persona',
        descripcion: 'Huella de carbono per cápita de la comunidad educativa',
        unidad: 'kgCO₂eq/persona',
        categoria: 'Aire y Emisiones',
        formula: 'Emisiones totales de GEI / Número de personas'
      },
      {
        nombre: 'Consumo de combustible por la flota de vehículos',
        descripcion: 'Volumen de combustible (gasolina, diésel) utilizado por los vehículos de la institución',
        unidad: 'L',
        categoria: 'Aire y Emisiones',
        formula: null
      },
      {
        nombre: 'Número de viajes en transporte sostenible',
        descripcion: 'Conteo de viajes realizados en autobús, bicicleta o a pie, medido a través de encuestas',
        unidad: 'unidades',
        categoria: 'Aire y Emisiones',
        formula: null
      },
      
      // 🌳 BIODIVERSIDAD Y ESPACIOS VERDES
      {
        nombre: 'Área de zonas verdes',
        descripcion: 'Superficie total de jardines, campos deportivos y áreas naturales en el campus',
        unidad: 'm²',
        categoria: 'Biodiversidad y Espacios Verdes',
        formula: null
      },
      {
        nombre: 'Área de zonas verdes por persona',
        descripcion: 'Espacio verde disponible para cada individuo',
        unidad: 'm²/persona',
        categoria: 'Biodiversidad y Espacios Verdes',
        formula: 'Área total de zonas verdes / Número de personas'
      },
      {
        nombre: 'Número de especies de flora nativa',
        descripcion: 'Conteo de las plantas endémicas de la región presentes en el campus',
        unidad: 'unidades',
        categoria: 'Biodiversidad y Espacios Verdes',
        formula: null
      },
      
      // 🏢 GESTIÓN Y EDUCACIÓN AMBIENTAL
      {
        nombre: 'Gasto en materiales sostenibles',
        descripcion: 'Inversión monetaria en productos con certificaciones ecológicas o de bajo impacto ambiental',
        unidad: '$',
        categoria: 'Gestión y Educación Ambiental',
        formula: null
      },
      {
        nombre: 'Número de iniciativas ambientales',
        descripcion: 'Conteo de proyectos, programas o campañas de sostenibilidad organizadas',
        unidad: 'unidades',
        categoria: 'Gestión y Educación Ambiental',
        formula: null
      },
      {
        nombre: 'Porcentaje de estudiantes/personal que han recibido formación ambiental',
        descripcion: 'Proporción de la comunidad que ha participado en talleres o cursos sobre sostenibilidad',
        unidad: '%',
        categoria: 'Gestión y Educación Ambiental',
        formula: '(Personas con formación ambiental / Total de personas) × 100'
      },
      {
        nombre: 'Número de asignaturas con enfoque ambiental',
        descripcion: 'Conteo de los cursos o materias en el plan de estudios que abordan la sostenibilidad',
        unidad: 'unidades',
        categoria: 'Gestión y Educación Ambiental',
        formula: null
      }
    ];

    console.log(`📊 Insertando ${indicators.length} indicadores...`);
    
    // Verificar si ya existen indicadores
    const [existingCount] = await pool.execute("SELECT COUNT(*) as count FROM indicadores");
    
    if (existingCount[0].count > 0) {
      console.log(`⚠️  Ya existen ${existingCount[0].count} indicadores en la base de datos.`);
      console.log('🔄 Actualizando indicadores existentes...');
      
      // Actualizar estructura de tabla para incluir formula
      await pool.execute(`
        ALTER TABLE indicadores 
        ADD COLUMN IF NOT EXISTS formula TEXT NULL
      `);
      
      // Limpiar indicadores existentes
      await pool.execute("DELETE FROM indicadores");
      console.log('🗑️  Indicadores anteriores eliminados');
    } else {
      // Asegurar que la tabla tenga la columna formula
      await pool.execute(`
        ALTER TABLE indicadores 
        ADD COLUMN IF NOT EXISTS formula TEXT NULL
      `);
    }

    // Insertar todos los indicadores
    for (const indicator of indicators) {
      await pool.execute(
        "INSERT INTO indicadores (nombre, descripcion, unidad, categoria, formula) VALUES (?, ?, ?, ?, ?)",
        [indicator.nombre, indicator.descripcion, indicator.unidad, indicator.categoria, indicator.formula]
      );
    }
    
    console.log('✅ Todos los indicadores han sido cargados exitosamente');
    
    // Mostrar resumen por categorías
    const [categories] = await pool.execute(`
      SELECT categoria, COUNT(*) as cantidad 
      FROM indicadores 
      GROUP BY categoria 
      ORDER BY categoria
    `);
    
    console.log('\n📈 Resumen de indicadores por categoría:');
    categories.forEach(cat => {
      const emoji = {
        'Residuos': '🌎',
        'Agua': '💧',
        'Energía': '⚡️',
        'Aire y Emisiones': '💨',
        'Biodiversidad y Espacios Verdes': '🌳',
        'Gestión y Educación Ambiental': '🏢'
      };
      console.log(`   ${emoji[cat.categoria] || '📊'} ${cat.categoria}: ${cat.cantidad} indicadores`);
    });
    
    const [totalCount] = await pool.execute("SELECT COUNT(*) as count FROM indicadores");
    console.log(`\n🎯 Total: ${totalCount[0].count} indicadores ambientales cargados`);
    
  } catch (error) {
    console.error('❌ Error al cargar indicadores:', error);
    throw error;
  }
}

// Ejecutar si el archivo se llama directamente
if (require.main === module) {
  loadEnvironmentalIndicators()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error durante la carga:', error);
      process.exit(1);
    });
}

module.exports = { loadEnvironmentalIndicators };