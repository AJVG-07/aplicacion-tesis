-- =======================================
-- BASE DE DATOS: Aplicación de Indicadores Ambientales
-- =======================================
CREATE DATABASE IF NOT EXISTS aplicacion_tesis;
USE aplicacion_tesis;

-- =======================================
-- TABLAS DE CATÁLOGOS
-- =======================================

-- Categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tipos de cálculo
CREATE TABLE tipos_calculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Unidades
CREATE TABLE unidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simbolo VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NOT NULL
);

-- =======================================
-- TABLAS PRINCIPALES
-- =======================================

-- Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'encargado') NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_recuperacion VARCHAR(255) NULL,
    expiracion_token TIMESTAMP NULL
);

-- Indicadores
CREATE TABLE indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria_id INT NOT NULL,
    tipo_calculo_id INT NOT NULL,
    unidad_id INT NOT NULL,
    descripcion TEXT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (tipo_calculo_id) REFERENCES tipos_calculo(id),
    FOREIGN KEY (unidad_id) REFERENCES unidades(id)
);

-- Asignación de indicadores a encargados
CREATE TABLE asignacion_indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    indicador_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE,
    UNIQUE KEY (usuario_id, indicador_id)
);

-- Configuración institucional
CREATE TABLE configuracion_institucional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_institucion VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255) NULL,
    poblacion_total INT NOT NULL,
    area_total DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Registros mensuales
CREATE TABLE registros_mensuales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicador_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    estado ENUM('Pendiente', 'Cargado', 'Cargado con Ceros') NOT NULL DEFAULT 'Pendiente',
    fecha_carga TIMESTAMP NULL,
    desbloqueado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE KEY (indicador_id, usuario_id, mes, anio)
);

-- Bitácora de auditoría
CREATE TABLE auditoria_registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registro_id INT NOT NULL,
    usuario_modificador_id INT NOT NULL,
    valor_anterior DECIMAL(15,2) NULL,
    valor_nuevo DECIMAL(15,2) NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT NULL,
    FOREIGN KEY (registro_id) REFERENCES registros_mensuales(id),
    FOREIGN KEY (usuario_modificador_id) REFERENCES usuarios(id)
);

-- Metas ambientales
CREATE TABLE metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicador_id INT NOT NULL,
    objetivo DECIMAL(15, 2) NOT NULL,
    fecha_limite DATE NOT NULL,
    estado ENUM('Cumplida', 'En Progreso', 'Atrasada') DEFAULT 'En Progreso',
    responsable_id INT NULL,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
);

-- Alertas
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicador_id INT NOT NULL,
    tipo_alerta ENUM('Valor Atipico', 'Recordatorio', 'Incumplimiento Meta') DEFAULT 'Valor Atipico',
    descripcion TEXT NOT NULL,
    valor_umbral DECIMAL(15, 2) NULL,
    fecha_generada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id)
);
