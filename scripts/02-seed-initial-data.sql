-- =======================================
-- DATOS INICIALES
-- =======================================

-- Categorías
INSERT INTO categorias (nombre) VALUES
('Residuos'),
('Agua'),
('Energía'),
('Aire y Emisiones'),
('Biodiversidad y Espacios Verdes'),
('Gestión y Educación Ambiental');

-- Tipos de cálculo
INSERT INTO tipos_calculo (nombre) VALUES
('Valor Simple'),
('Por Persona'),
('Por m²'),
('Porcentaje'),
('Conteo');

-- Unidades
INSERT INTO unidades (simbolo, descripcion) VALUES
('kg', 'kilogramos'),
('kg/persona', 'kilogramos por persona'),
('kg/m2', 'kilogramos por metro cuadrado'),
('%', 'porcentaje'),
('L', 'litros'),
('L/persona', 'litros por persona'),
('L/m2', 'litros por metro cuadrado'),
('m3', 'metros cúbicos'),
('kWh', 'kilovatios-hora'),
('kWh/persona', 'kilovatios-hora por persona'),
('kWh/m2', 'kilovatios-hora por metro cuadrado'),
('tCO2eq', 'toneladas de CO2 equivalente'),
('kgCO2eq/persona', 'kilogramos de CO2 equivalente por persona'),
('unidades', 'conteo'),
('m2', 'metros cuadrados'),
('m2/persona', 'metros cuadrados por persona'),
('$', 'dólares');

-- Usuario administrador por defecto
INSERT INTO usuarios (nombre, apellido, email, contrasena_hash, rol) 
VALUES ('Admin', 'Sistema', 'admin@sistema.com', '$2b$10$example_hash_here', 'administrador');

-- Configuración institucional por defecto
INSERT INTO configuracion_institucional (nombre_institucion, ubicacion, poblacion_total, area_total, fecha_inicio) 
VALUES ('Universidad Ejemplo', 'Ciudad Ejemplo', 5000, 50000.00, '2024-01-01');
