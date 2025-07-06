const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

const router = express.Router();

// Кэш на 5 минут для погодных данных
const weatherCache = new NodeCache({ stdTTL: 300 });

/**
 * Middleware для логирования запросов погоды
 */
const logWeatherRequest = async (req, res, next) => {
    try {
        const { city_name } = req.body || req.query;
        const userIP = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        const telegramUserId = req.headers['x-telegram-user-id'];
        
        // Записываем запрос в базу данных
        await db.query(`
            INSERT INTO weather.weather_requests 
            (city_name, user_ip, user_agent, telegram_user_id, request_timestamp)
            VALUES ($1, $2, $3, $4, NOW())
        `, [city_name, userIP, userAgent, telegramUserId]);
        
        next();
    } catch (error) {
        logger.error('Ошибка логирования запроса погоды:', error);
        next(); // Продолжаем даже если логирование не удалось
    }
};

/**
 * Валидация для запросов погоды
 */
const validateWeatherRequest = [
    body('city_name')
        .notEmpty()
        .withMessage('Название города обязательно')
        .isLength({ min: 2, max: 100 })
        .withMessage('Название города должно быть от 2 до 100 символов')
        .trim()
        .escape()
];

/**
 * POST /api/weather/current
 * Получение текущей погоды
 */
router.post('/current', 
    validateWeatherRequest,
    logWeatherRequest,
    async (req, res) => {
        try {
            // Проверяем валидацию
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Ошибка валидации',
                    details: errors.array()
                });
            }

            const { city_name, coordinates } = req.body;
            const cacheKey = `current_${city_name.toLowerCase()}`;
            
            // Проверяем кэш
            const cachedData = weatherCache.get(cacheKey);
            if (cachedData) {
                logger.debug(`Погода для ${city_name} получена из кэша`);
                return res.json({
                    success: true,
                    data: cachedData,
                    cached: true
                });
            }

            // Здесь можно добавить логику для получения данных о погоде
            // Пока возвращаем заглушку
            const weatherData = {
                city: city_name,
                temperature: Math.round(Math.random() * 30 - 5), // Заглушка
                description: 'Ясно',
                humidity: Math.round(Math.random() * 100),
                pressure: Math.round(Math.random() * 100 + 1000),
                wind_speed: Math.round(Math.random() * 20),
                timestamp: new Date().toISOString()
            };

            // Сохраняем в кэш
            weatherCache.set(cacheKey, weatherData);

            // Опционально сохраняем в БД
            try {
                await db.query(`
                    INSERT INTO weather.weather_cache 
                    (city_name, weather_data, cached_at, expires_at)
                    VALUES ($1, $2, NOW(), NOW() + INTERVAL '5 minutes')
                    ON CONFLICT (city_name) DO UPDATE SET
                        weather_data = $2,
                        cached_at = NOW(),
                        expires_at = NOW() + INTERVAL '5 minutes'
                `, [city_name, JSON.stringify(weatherData)]);
            } catch (dbError) {
                logger.warn('Не удалось сохранить в БД кэш:', dbError.message);
            }

            res.json({
                success: true,
                data: weatherData,
                cached: false
            });

        } catch (error) {
            logger.error('Ошибка получения текущей погоды:', error);
            res.status(500).json({
                error: 'Внутренняя ошибка сервера',
                message: 'Не удалось получить данные о погоде'
            });
        }
    }
);

/**
 * POST /api/weather/forecast
 * Получение прогноза погоды
 */
router.post('/forecast',
    validateWeatherRequest,
    logWeatherRequest,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Ошибка валидации',
                    details: errors.array()
                });
            }

            const { city_name, days = 5 } = req.body;
            const cacheKey = `forecast_${city_name.toLowerCase()}_${days}`;
            
            // Проверяем кэш
            const cachedData = weatherCache.get(cacheKey);
            if (cachedData) {
                return res.json({
                    success: true,
                    data: cachedData,
                    cached: true
                });
            }

            // Заглушка для прогноза
            const forecastData = {
                city: city_name,
                forecast: Array.from({ length: days }, (_, i) => ({
                    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    temperature_max: Math.round(Math.random() * 30 - 5),
                    temperature_min: Math.round(Math.random() * 20 - 10),
                    description: ['Ясно', 'Облачно', 'Дождь', 'Снег'][Math.floor(Math.random() * 4)],
                    humidity: Math.round(Math.random() * 100),
                    wind_speed: Math.round(Math.random() * 20)
                })),
                timestamp: new Date().toISOString()
            };

            // Сохраняем в кэш
            weatherCache.set(cacheKey, forecastData);

            res.json({
                success: true,
                data: forecastData,
                cached: false
            });

        } catch (error) {
            logger.error('Ошибка получения прогноза погоды:', error);
            res.status(500).json({
                error: 'Внутренняя ошибка сервера',
                message: 'Не удалось получить прогноз погоды'
            });
        }
    }
);

/**
 * GET /api/weather/cities
 * Получение списка популярных городов
 */
router.get('/cities', async (req, res) => {
    try {
        const { limit = 20, search } = req.query;
        
        let query = `
            SELECT DISTINCT c.name, c.country, COUNT(wr.id) as request_count
            FROM weather.cities c
            LEFT JOIN weather.weather_requests wr ON c.name ILIKE wr.city_name
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE c.name ILIKE $1`;
            params.push(`%${search}%`);
        }
        
        query += `
            GROUP BY c.name, c.country
            ORDER BY request_count DESC, c.name
            LIMIT $${params.length + 1}
        `;
        params.push(parseInt(limit));
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        logger.error('Ошибка получения списка городов:', error);
        res.status(500).json({
            error: 'Не удалось получить список городов'
        });
    }
});

/**
 * GET /api/weather/stats
 * Статистика запросов
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(DISTINCT city_name) as unique_cities,
                COUNT(DISTINCT user_ip) as unique_users,
                AVG(response_time_ms) as avg_response_time,
                COUNT(*) FILTER (WHERE request_timestamp > NOW() - INTERVAL '24 hours') as requests_last_24h,
                COUNT(*) FILTER (WHERE success = false) as failed_requests
            FROM weather.weather_requests
            WHERE request_timestamp > NOW() - INTERVAL '30 days'
        `);
        
        const topCities = await db.query(`
            SELECT 
                city_name,
                COUNT(*) as request_count,
                MAX(request_timestamp) as last_request
            FROM weather.weather_requests
            WHERE request_timestamp > NOW() - INTERVAL '7 days'
            GROUP BY city_name
            ORDER BY request_count DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                overview: stats.rows[0],
                top_cities: topCities.rows
            }
        });
        
    } catch (error) {
        logger.error('Ошибка получения статистики:', error);
        res.status(500).json({
            error: 'Не удалось получить статистику'
        });
    }
});

/**
 * DELETE /api/weather/cache
 * Очистка кэша (только для администраторов)
 */
router.delete('/cache', async (req, res) => {
    try {
        // Очищаем кэш в памяти
        weatherCache.flushAll();
        
        // Очищаем кэш в базе данных
        await db.query('DELETE FROM weather.weather_cache WHERE expires_at < NOW()');
        
        res.json({
            success: true,
            message: 'Кэш очищен'
        });
        
    } catch (error) {
        logger.error('Ошибка очистки кэша:', error);
        res.status(500).json({
            error: 'Не удалось очистить кэш'
        });
    }
});

module.exports = router;