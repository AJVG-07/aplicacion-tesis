const { pool } = require("../config/database")

// Función para ejecutar la carga automática de ceros
async function executeAutoZeroDataJob() {
  console.log('🔄 Iniciando proceso de carga automática de ceros...')
  
  try {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    
    // Calcular el mes anterior (mes objetivo)
    let targetMonth = currentMonth - 1
    let targetYear = currentYear
    
    if (targetMonth === 0) {
      targetMonth = 12
      targetYear = currentYear - 1
    }
    
    console.log(`📅 Procesando datos para: ${getMonthName(targetMonth)} ${targetYear}`)
    
    // Obtener todos los indicadores y usuarios asignados que no tienen registros para el mes objetivo
    const [missingRecords] = await pool.execute(`
      SELECT DISTINCT
        ai.usuario_id,
        ai.indicador_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        i.nombre as indicador_nombre
      FROM asignacion_indicadores ai
      INNER JOIN usuarios u ON ai.usuario_id = u.id
      INNER JOIN indicadores i ON ai.indicador_id = i.id
      WHERE u.estado = 'activo'
      AND u.rol = 'encargado'
      AND NOT EXISTS (
        SELECT 1 FROM registros r 
        WHERE r.indicador_id = ai.indicador_id 
        AND r.usuario_id = ai.usuario_id
        AND r.mes = ?
        AND r.ano = ?
      )
    `, [targetMonth, targetYear])
    
    if (missingRecords.length === 0) {
      console.log('✅ No hay registros pendientes para procesar')
      return {
        success: true,
        message: 'No hay registros pendientes',
        processed: 0
      }
    }
    
    console.log(`📊 Encontrados ${missingRecords.length} registros faltantes`)
    
    // Insertar registros con valor 0 para cada combinación faltante
    let processedCount = 0
    const errors = []
    
    for (const record of missingRecords) {
      try {
        await pool.execute(`
          INSERT INTO registros (indicador_id, usuario_id, valor, mes, ano, estado, observaciones)
          VALUES (?, ?, 0, ?, ?, 'cargado_con_ceros', 'Valor cargado automáticamente por no haber registro manual')
        `, [record.indicador_id, record.usuario_id, targetMonth, targetYear])
        
        processedCount++
        
        // Log detallado cada 50 registros
        if (processedCount % 50 === 0) {
          console.log(`   ⏳ Procesados ${processedCount}/${missingRecords.length} registros...`)
        }
      } catch (error) {
        const errorMsg = `Error procesando ${record.indicador_nombre} para ${record.usuario_nombre}: ${error.message}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }
    }
    
    // Generar alerta para administradores sobre la carga automática
    try {
      await pool.execute(`
        INSERT INTO alertas (tipo, titulo, descripcion, estado)
        VALUES ('sistema', ?, ?, 'nueva')
      `, [
        'Carga automática de datos realizada',
        `Se procesaron automáticamente ${processedCount} registros con valor 0 para ${getMonthName(targetMonth)} ${targetYear}. ${errors.length > 0 ? `Errores: ${errors.length}` : 'Sin errores.'}`
      ])
    } catch (alertError) {
      console.error('⚠️  Error al crear alerta:', alertError.message)
    }
    
    const result = {
      success: true,
      message: `Proceso completado. ${processedCount} registros procesados${errors.length > 0 ? ` con ${errors.length} errores` : ''}`,
      processed: processedCount,
      errors: errors.length > 0 ? errors : null,
      targetMonth,
      targetYear,
      monthName: getMonthName(targetMonth)
    }
    
    console.log(`✅ Proceso completado exitosamente:`)
    console.log(`   📈 Registros procesados: ${processedCount}`)
    console.log(`   ❌ Errores: ${errors.length}`)
    console.log(`   📅 Periodo: ${getMonthName(targetMonth)} ${targetYear}`)
    
    return result
    
  } catch (error) {
    const errorMsg = `Error en proceso de carga automática: ${error.message}`
    console.error('💥', errorMsg)
    
    // Crear alerta de error
    try {
      await pool.execute(`
        INSERT INTO alertas (tipo, titulo, descripcion, estado)
        VALUES ('sistema', 'Error en carga automática', ?, 'nueva')
      `, [errorMsg])
    } catch (alertError) {
      console.error('⚠️  Error al crear alerta de error:', alertError.message)
    }
    
    throw error
  }
}

// Verificar si el proceso debe ejecutarse hoy
async function shouldRunToday() {
  const now = new Date()
  const currentDay = now.getDate()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // Solo ejecutar el día 6 de cada mes
  if (currentDay !== 6) {
    return {
      shouldRun: false,
      reason: `Hoy es día ${currentDay}. El proceso solo se ejecuta el día 6 de cada mes.`
    }
  }
  
  // Calcular mes objetivo
  let targetMonth = currentMonth - 1
  let targetYear = currentYear
  
  if (targetMonth === 0) {
    targetMonth = 12
    targetYear = currentYear - 1
  }
  
  // Verificar si ya se ejecutó este mes
  const [lastExecution] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM alertas 
    WHERE tipo = 'sistema' 
    AND titulo = 'Carga automática de datos realizada'
    AND DATE(fecha_creacion) = CURDATE()
  `)
  
  if (lastExecution[0].count > 0) {
    return {
      shouldRun: false,
      reason: 'El proceso ya se ejecutó hoy.'
    }
  }
  
  return {
    shouldRun: true,
    targetMonth,
    targetYear,
    monthName: getMonthName(targetMonth)
  }
}

// Función principal que verifica y ejecuta si es necesario
async function runAutoZeroDataJobIfNeeded() {
  try {
    const check = await shouldRunToday()
    
    if (!check.shouldRun) {
      console.log('⏭️  Saltando carga automática:', check.reason)
      return { skipped: true, reason: check.reason }
    }
    
    console.log(`🎯 Ejecutando carga automática para ${check.monthName} ${check.targetYear}`)
    return await executeAutoZeroDataJob()
    
  } catch (error) {
    console.error('💥 Error en carga automática:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

// Endpoint para ejecutar manualmente (solo admin)
async function runManualAutoZero(req, res) {
  try {
    // Solo administradores pueden ejecutar manualmente
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden ejecutar este proceso"
      })
    }
    
    console.log(`🔧 Ejecución manual iniciada por: ${req.user.nombre} ${req.user.apellido}`)
    
    const result = await executeAutoZeroDataJob()
    
    res.json({
      success: true,
      message: "Proceso ejecutado manualmente",
      data: result
    })
  } catch (error) {
    console.error("Error en ejecución manual:", error)
    res.status(500).json({
      success: false,
      message: "Error al ejecutar el proceso",
      error: error.message
    })
  }
}

// Función auxiliar para nombres de meses
function getMonthName(monthNumber) {
  const months = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[monthNumber] || 'Mes inválido'
}

module.exports = {
  executeAutoZeroDataJob,
  shouldRunToday,
  runAutoZeroDataJobIfNeeded,
  runManualAutoZero
}