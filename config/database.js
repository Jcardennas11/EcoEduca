const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoeduca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para obtener conexión
const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('Error obteniendo conexión de la base de datos:', error);
        throw error;
    }
};

// Función para ejecutar consultas
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Error ejecutando consulta:', error);
        throw error;
    }
};

// Función para inicializar la base de datos
const initializeDatabase = async () => {
    try {
        const connection = await getConnection();
        
        // Crear base de datos si no existe
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        
        // Usar la base de datos
        await connection.execute(`USE ${dbConfig.database}`);
        
        // Crear tabla de usuarios
        await connection.execute(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Crear tabla de sesiones
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sesiones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                token VARCHAR(500) NOT NULL,
                fecha_expiracion DATETIME NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Base de datos inicializada correctamente');
        connection.release();
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        throw error;
    }
};

module.exports = {
    getConnection,
    query,
    initializeDatabase,
    pool
};
