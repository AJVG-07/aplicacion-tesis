-- =======================================
-- INDICADORES PREDEFINIDOS
-- =======================================

-- 🌎 Residuos
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Generación total de residuos', 1, 1, 1, 'Peso total de los residuos generados en un período'),
('Generación de residuos por persona', 1, 2, 2, 'Peso de los residuos generados por cada individuo'),
('Generación de residuos por metro cuadrado', 1, 3, 3, 'Peso de los residuos por área de la institución'),
('Porcentaje de reciclaje', 1, 4, 4, 'Proporción de residuos que se separan para reciclaje'),
('Peso de residuos electrónicos desechados', 1, 1, 1, 'Peso de equipos electrónicos desechados'),
('Porcentaje de compostaje de residuos orgánicos', 1, 4, 4, 'Proporción de materia orgánica destinada a compostaje');

-- 💧 Agua
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Consumo total de agua', 2, 1, 5, 'Volumen total de agua utilizada por la institución'),
('Consumo de agua por persona', 2, 2, 6, 'Volumen de agua que consume cada individuo'),
('Consumo de agua por metro cuadrado', 2, 3, 7, 'Volumen de agua por área de la institución'),
('Volumen de agua de lluvia recolectada', 2, 1, 5, 'Cantidad de agua pluvial captada'),
('Agua reutilizada o tratada', 2, 1, 5, 'Volumen de agua reciclada para riego o limpieza'),
('Número de fugas de agua detectadas y reparadas', 2, 5, 14, 'Eficiencia del mantenimiento de la red de agua');

-- ⚡ Energía
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Consumo total de energía eléctrica', 3, 1, 9, 'Energía eléctrica total consumida'),
('Consumo de energía por persona', 3, 2, 10, 'Energía consumida por cada individuo'),
('Consumo de energía por metro cuadrado', 3, 3, 11, 'Energía consumida por superficie'),
('Consumo de gas natural o GLP', 3, 1, 8, 'Volumen de gas utilizado'),
('Porcentaje de energía renovable', 3, 4, 4, 'Proporción de energía proveniente de fuentes limpias'),
('Ahorro de energía en periodos no lectivos', 3, 4, 4, 'Reducción del consumo en vacaciones o fines de semana');

-- 💨 Aire y Emisiones
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Emisiones de gases de efecto invernadero (GEI)', 4, 1, 12, 'Huella de carbono de la institución'),
('Emisiones de GEI por persona', 4, 2, 13, 'Huella de carbono per cápita'),
('Consumo de combustible por la flota de vehículos', 4, 1, 5, 'Volumen de combustible usado por la flota'),
('Número de viajes en transporte sostenible', 4, 5, 14, 'Viajes realizados en transporte sostenible');

-- 🌳 Biodiversidad y Espacios Verdes
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Área de zonas verdes', 5, 1, 15, 'Superficie total de jardines y áreas naturales'),
('Área de zonas verdes por persona', 5, 2, 16, 'Espacio verde por persona'),
('Número de especies de flora nativa', 5, 5, 14, 'Conteo de especies endémicas presentes');

-- 🏢 Gestión y Educación Ambiental
INSERT INTO indicadores (nombre, categoria_id, tipo_calculo_id, unidad_id, descripcion) VALUES
('Gasto en materiales sostenibles', 6, 1, 17, 'Inversión en productos sostenibles'),
('Número de iniciativas ambientales', 6, 5, 14, 'Proyectos o campañas de sostenibilidad'),
('Porcentaje de estudiantes/personal con formación ambiental', 6, 4, 4, 'Proporción de la comunidad con formación ambiental'),
('Número de asignaturas con enfoque ambiental', 6, 5, 14, 'Conteo de asignaturas con enfoque en sostenibilidad');
