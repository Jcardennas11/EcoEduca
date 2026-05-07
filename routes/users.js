const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query, getConnection } = require('../config/database');

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
};

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

// Obtener perfil del usuario
router.get('/profile', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const users = await query(
            `SELECT id, nombre, apellido, email, telefono, rol, email_verificado, 
                    fecha_registro, ultimo_login, activo 
             FROM usuarios WHERE id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            user: users[0]
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    } finally {
        if (connection) connection.release();
    }
});

// Actualizar perfil del usuario
router.put('/profile', [
    authenticateToken,
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('apellido').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    body('telefono').optional().isMobilePhone('es-CO').withMessage('El teléfono no es válido'),
    handleValidationErrors
], async (req, res) => {
    const { nombre, apellido, telefono } = req.body;
    let connection;
    
    try {
        connection = await getConnection();
        
        // Construir consulta dinámica
        const updates = [];
        const values = [];
        
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            values.push(nombre);
        }
        
        if (apellido !== undefined) {
            updates.push('apellido = ?');
            values.push(apellido);
        }
        
        if (telefono !== undefined) {
            updates.push('telefono = ?');
            values.push(telefono);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No se proporcionaron datos para actualizar'
            });
        }
        
        updates.push('updated_at = NOW()');
        values.push(req.user.userId);
        
        await query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Obtener datos actualizados
        const users = await query(
            `SELECT id, nombre, apellido, email, telefono, rol, email_verificado, 
                    fecha_registro, ultimo_login, activo 
             FROM usuarios WHERE id = ?`,
            [req.user.userId]
        );

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: users[0]
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    } finally {
        if (connection) connection.release();
    }
});

// Cambiar contraseña
router.put('/password', [
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
    body('newPassword').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La nueva contraseña debe tener mayúsculas, minúsculas y números'),
    handleValidationErrors
], async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    let connection;
    
    try {
        connection = await getConnection();
        
        // Obtener contraseña actual del usuario
        const users = await query(
            'SELECT password_hash FROM usuarios WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({
                error: 'La contraseña actual es incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await query(
            'UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?',
            [newPasswordHash, req.user.userId]
        );

        // Cerrar todas las sesiones excepto la actual
        const currentToken = req.headers.authorization?.replace('Bearer ', '');
        await query(
            'DELETE FROM sesiones WHERE usuario_id = ? AND token != ?',
            [req.user.userId, currentToken]
        );

        res.json({
            message: 'Contraseña actualizada exitosamente. Se han cerrado las demás sesiones por seguridad.'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    } finally {
        if (connection) connection.release();
    }
});

// Obtener sesiones activas
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await query(
            `SELECT id, fecha_expiracion, ip_address, user_agent, created_at 
             FROM sesiones WHERE usuario_id = ? AND fecha_expiracion > NOW() 
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json({
            sessions
        });

    } catch (error) {
        console.error('Error obteniendo sesiones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Cerrar sesión específica
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    
    try {
        const result = await query(
            'DELETE FROM sesiones WHERE id = ? AND usuario_id = ?',
            [sessionId, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Sesión no encontrada'
            });
        }

        res.json({
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        console.error('Error cerrando sesión:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Cerrar todas las sesiones excepto la actual
router.delete('/sessions', authenticateToken, async (req, res) => {
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    
    try {
        await query(
            'DELETE FROM sesiones WHERE usuario_id = ? AND token != ?',
            [req.user.userId, currentToken]
        );

        res.json({
            message: 'Todas las demás sesiones han sido cerradas exitosamente'
        });

    } catch (error) {
        console.error('Error cerrando sesiones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Eliminar cuenta de usuario
router.delete('/account', authenticateToken, async (req, res) => {
    let connection;
    
    try {
        connection = await getConnection();
        
        // Iniciar transacción
        await connection.execute('START TRANSACTION');
        
        // Eliminar sesiones del usuario
        await connection.execute(
            'DELETE FROM sesiones WHERE usuario_id = ?',
            [req.user.userId]
        );
        
        // Eliminar usuario (marcar como inactivo en lugar de eliminar)
        await connection.execute(
            'UPDATE usuarios SET activo = FALSE, updated_at = NOW() WHERE id = ?',
            [req.user.userId]
        );
        
        await connection.execute('COMMIT');
        
        res.json({
            message: 'Cuenta eliminada exitosamente'
        });

    } catch (error) {
        if (connection) {
            await connection.execute('ROLLBACK');
        }
        console.error('Error eliminando cuenta:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
