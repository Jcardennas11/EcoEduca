const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Limitar peticiones
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP, intenta más tarde'
});
app.use(limiter);

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static('.'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'API EcoEduca funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌱 Servidor EcoEduca corriendo en http://localhost:${PORT}`);
    console.log(`🔍 API disponible en http://localhost:${PORT}/api`);
});

// Probar conexión a base de datos
db.getConnection()
    .then(connection => {
        console.log('✅ Conectado a la base de datos MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err);
    });

module.exports = app;
