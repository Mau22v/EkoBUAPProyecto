
-- =====================================================
-- Proyecto: EkoBUAP
-- Archivo: schema.sql
-- Descripcion: Estructura de la base de datos
-- =====================================================

CREATE DATABASE IF NOT EXISTS ekobuap
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ekobuap;

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
    puntos INT NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Elementos identificados mediante QR
CREATE TABLE IF NOT EXISTS qr_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    tipo ENUM('contenedor', 'bicicleta') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(150),
    puntos INT NOT NULL DEFAULT 10,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Historial de escaneos
CREATE TABLE IF NOT EXISTS escaneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    qr_id INT NOT NULL,
    puntos_obtenidos INT NOT NULL,
    fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (qr_id)
        REFERENCES qr_items(id)
        ON DELETE CASCADE
);

-- 4. Catalogo de insignias
CREATE TABLE IF NOT EXISTS insignias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    puntos_requeridos INT NOT NULL
);

-- 5. Insignias obtenidas por cada usuario
CREATE TABLE IF NOT EXISTS usuario_insignias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    insignia_id INT NOT NULL,
    fecha_obtenida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (usuario_id, insignia_id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (insignia_id)
        REFERENCES insignias(id)
        ON DELETE CASCADE
);

-- 6. Reportes de usuarios
CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    qr_id INT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'atendido', 'cerrado')
        NOT NULL DEFAULT 'pendiente',
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (qr_id)
        REFERENCES qr_items(id)
        ON DELETE SET NULL
);

-- =====================================================
-- DATOS INICIALES: elementos QR
-- INSERT IGNORE evita duplicar codigos existentes.
-- =====================================================

INSERT IGNORE INTO qr_items
(codigo, tipo, nombre, descripcion, ubicacion, puntos)
VALUES
(
    'CONT-001',
    'contenedor',
    'Contenedor Organico',
    'Contenedor destinado a residuos organicos.',
    'Ciudad Universitaria',
    10
),
(
    'CONT-002',
    'contenedor',
    'Contenedor Inorganico',
    'Contenedor destinado a residuos inorganicos.',
    'Ciudad Universitaria',
    10
),
(
    'CONT-003',
    'contenedor',
    'Contenedor PET',
    'Contenedor destinado a botellas PET.',
    'Ciudad Universitaria',
    15
),
(
    'BIKE-001',
    'bicicleta',
    'Bicicleta BUAP 001',
    'Bicicleta para uso dentro del campus.',
    'Facultad de Ciencias de la Computacion',
    20
);

-- =====================================================
-- DATOS INICIALES: insignias
-- =====================================================

INSERT IGNORE INTO insignias
(nombre, descripcion, puntos_requeridos)
VALUES
(
    'Primer paso',
    'Realiza tu primera accion ambiental.',
    10
),
(
    'Ecoactivo',
    'Alcanza 50 puntos ambientales.',
    50
),
(
    'Guardian ambiental',
    'Alcanza 100 puntos ambientales.',
    100
),
(
    'Heroe EkoBUAP',
    'Alcanza 200 puntos ambientales.',
    200
);