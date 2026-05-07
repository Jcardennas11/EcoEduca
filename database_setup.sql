-- Script para configurar la base de datos de EcoEduca
-- Ejecutar este script en MySQL para crear la base de datos y tablas

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS ecoeduca 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE ecoeduca;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    rol ENUM('usuario', 'admin') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_activo (activo),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token),
    INDEX idx_expiracion (fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de progresos educativos (futura expansión)
CREATE TABLE IF NOT EXISTS progresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    leccion VARCHAR(100),
    progreso DECIMAL(5,2) DEFAULT 0.00,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_modulo (usuario_id, modulo),
    UNIQUE KEY unique_usuario_modulo_leccion (usuario_id, modulo, leccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de evaluaciones (futura expansión)
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_evaluacion ENUM('diagnostico', 'modulo', 'final') NOT NULL,
    puntaje DECIMAL(5,2) NOT NULL,
    respuestas JSON,
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_tipo (usuario_id, tipo_evaluacion),
    INDEX idx_fecha (fecha_evaluacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto
-- Contraseña: Admin123! (debe cambiarse en producción)
INSERT IGNORE INTO usuarios (nombre, apellido, email, password_hash, rol, email_verificado) 
VALUES (
    'Administrador',
    'EcoEduca',
    'admin@ecoeduca.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e',
    'admin',
    TRUE
);

-- Crear vista de usuarios activos
CREATE OR REPLACE VIEW usuarios_activos AS
SELECT 
    id,
    nombre,
    apellido,
    email,
    telefono,
    rol,
    email_verificado,
    fecha_registro,
    ultimo_login,
    created_at,
    updated_at
FROM usuarios 
WHERE activo = TRUE;

-- Crear vista de sesiones activas
CREATE OR REPLACE VIEW sesiones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    s.fecha_expiracion,
    s.ip_address,
    s.created_at
FROM sesiones s
INNER JOIN usuarios u ON s.usuario_id = u.id
WHERE s.fecha_expiracion > NOW()
ORDER BY s.created_at DESC;

-- Mostrar mensaje de éxito
SELECT 'Base de datos EcoEduca configurada exitosamente' AS mensaje;
