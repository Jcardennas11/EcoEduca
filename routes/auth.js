const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query, getConnection } = require('../config/database');

const router = express.Router();

// Middleware de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: errors.array()
        });
    }
    next();
};

// Registro de usuario
router.post('/register', [
    body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('apellido').trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('El email no es válido'),
    body('telefono').optional().isMobilePhone('es-CO').withMessage('El teléfono no es válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe tener mayúsculas, minúsculas y números'),
    body('terms').equals('true').withMessage('Debes aceptar los términos y condiciones')
], handleValidationErrors, async (req, res) => {
    const { nombre, apellido, email, telefono, password } = req.body;

    let connection;
    try {
        connection = await getConnection();
        
        // Verificar si el usuario ya existe
        const existingUser = await query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const result = await query(
            `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, email, telefono || null, passwordHash]
        );

        // Generar token JWT
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Obtener datos del usuario creado
        const newUser = await query(
            'SELECT id, nombre, apellido, email, telefono, rol, fecha_registro FROM usuarios WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser[0],
            token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Login de usuario
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
], handleValidationErrors, async (req, res) => {
    const { email, password, remember } = req.body;

    let connection;
    try {
        connection = await getConnection();

        // Buscar usuario
        const users = await query(
            'SELECT id, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                error: 'Tu cuenta ha sido desactivada'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Actualizar último login
        await query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Generar token JWT
        const expiresIn = remember ? '7d' : (process.env.JWT_EXPIRES_IN || '24h');
        const token = jwt.sign(
            { userId: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        // Guardar sesión
        const decodedToken = jwt.decode(token);
        await query(
            'INSERT INTO sesiones (usuario_id, token, fecha_expiracion, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
            [
                user.id,
                token,
                new Date(decodedToken.exp * 1000),
                req.ip || null,
                req.get('User-Agent') || null
            ]
        );

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Logout de usuario
router.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(400).json({
            error: 'Token no proporcionado'
        });
    }

    try {
        await query(
            'DELETE FROM sesiones WHERE token = ?',
            [token]
        );

        res.json({
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que la sesión exista
        const sessions = await query(
            'SELECT * FROM sesiones WHERE token = ? AND fecha_expiracion > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({
                error: 'Sesión inválida o expirada'
            });
        }

        // Obtener datos del usuario
        const users = await query(
            'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ? AND activo = TRUE',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Usuario no encontrado o inactivo'
            });
        }

        res.json({
            valid: true,
            user: users[0]
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }
        
        console.error('Error verificando token:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Recuperar contraseña
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('El email no es válido')
], handleValidationErrors, async (req, res) => {
    const { email } = req.body;

    try {
        const users = await query(
            'SELECT id, nombre FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            // Por seguridad, no revelamos si el email existe o no
            return res.json({
                message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña'
            });
        }

        // Aquí iría la lógica para enviar email de recuperación
        // Por ahora, solo respondemos exitosamente
        
        res.json({
            message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña'
        });

    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
