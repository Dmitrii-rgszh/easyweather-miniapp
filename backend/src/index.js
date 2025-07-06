console.log('🚀 EasyWeather Backend запускается...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Загружаем .env из корня проекта
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('📦 Модули загружены');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🗄️ POSTGRES_DB:', process.env.POSTGRES_DB);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

console.log('📡 Порт для запуска:', PORT);

// Подключаем базу данных
const { checkDatabaseHealth, initializeTables } = require('./database/db');

// Инициализируем таблицы при запуске
initializeTables().catch(err => {
    console.error('❌ Ошибка инициализации БД:', err);
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🔧 Middleware настроен');

// Health check
app.get('/health', (req, res) => {
    console.log('💊 Health check запрошен');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'EasyWeather Backend is running!',
        port: PORT,
        env: process.env.NODE_ENV || 'development'
    });
});

// Database health check
app.get('/health/database', async (req, res) => {
    try {
        const dbHealth = await checkDatabaseHealth();
        res.json(dbHealth);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

// API информация
app.get('/', (req, res) => {
    console.log('📝 Главная страница API запрошена');
    res.json({
        message: 'EasyWeather API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            database: '/health/database',
            weather: '/api/weather',
            admin: '/api/admin'
        }
    });
});

// API маршруты
const weatherRoutes = require('./routes/weather');
app.use('/api/weather', weatherRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

console.log('🛣️ Маршруты настроены');

// Запуск сервера
app.listen(PORT, () => {
    console.log('');
    console.log('🎉 СЕРВЕР УСПЕШНО ЗАПУЩЕН!');
    console.log(`🚀 EasyWeather Backend работает на порту ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API info: http://localhost:${PORT}/`);
    console.log('');
});

console.log('📋 Скрипт инициализации завершен');

module.exports = app;