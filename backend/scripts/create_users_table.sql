-- Script para crear la tabla usuarios y datos iniciales
-- Base de datos: aplicacion_tesis

USE aplicacion_tesis;

-- Crear tabla usuarios si no existe
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
);

-- Crear tabla indicadores si no existe (necesaria para las asignaciones)
CREATE TABLE IF NOT EXISTS indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    unidad VARCHAR(50),
    categoria VARCHAR(100),
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla asignacion_indicadores si no existe
CREATE TABLE IF NOT EXISTS asignacion_indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    indicador_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (usuario_id, indicador_id)
);

-- Insertar usuario administrador inicial (contraseña: admin123)
-- Hash generado con bcrypt para "admin123"
INSERT IGNORE INTO usuarios (nombre, apellido, email, contrasena_hash, rol) 
VALUES ('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$8K1p/a0dLVMeVfcQTvjOWuD4RuQwuDXEUV.cJ9A3tpMqGn5LiMJhm', 'administrador');

-- Insertar algunos indicadores de ejemplo
INSERT IGNORE INTO indicadores (nombre, descripcion, unidad, categoria) VALUES 
('Calidad del Aire', 'Medición de PM2.5 en el ambiente', 'μg/m³', 'Aire'),
('Calidad del Agua', 'Medición de pH y contaminantes en agua', 'pH', 'Agua'),
('Ruido Ambiental', 'Medición de decibeles en zonas urbanas', 'dB', 'Ruido'),
('Temperatura Ambiental', 'Monitoreo de temperatura atmosférica', '°C', 'Clima'),
('Humedad Relativa', 'Porcentaje de humedad en el ambiente', '%', 'Clima');

-- Mostrar información sobre el usuario admin creado
SELECT 'Usuario administrador creado:' as mensaje;
SELECT id, nombre, apellido, email, rol, estado, fecha_creacion 
FROM usuarios 
WHERE email = 'admin@sistema.com';