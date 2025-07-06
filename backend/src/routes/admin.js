const express = require('express');
const db = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Панель администратора с общей статистикой
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Общая статистика
        const statsQuery = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM weather.weather_requests) as total_requests,
                (SELECT COUNT(DISTINCT city_name) FROM weather.weather_requests) as unique_cities,
                (SELECT COUNT(DISTINCT user_ip) FROM weather.weather_requests) as unique_users,
                (SELECT COUNT(*) FROM auth.admins WHERE is_active = true) as active_admins,
                (SELECT COUNT(*) FROM auth.admin_sessions WHERE is_active = true AND expires_at > NOW()) as active_sessions
        `);

        // Статистика за последние 24 часа
        const recentStatsQuery = await db.query(`
            SELECT 
                COUNT(*) as requests_24h,
                COUNT(DISTINCT city_name) as cities_24h,
                COUNT(DISTINCT user_ip) as users_24h,
                AVG(response_time_ms) as avg_response_time
            FROM weather.weather_requests
            WHERE request_timestamp > NOW() - INTERVAL '24 hours'
        `);

        // Топ городов за неделю
        const topCitiesQuery = await db.query(`
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

        // Активность по часам за последние 24 часа
        const hourlyActivityQuery = await db.query(`
            SELECT 
                EXTRACT(hour FROM request_timestamp) as hour,
                COUNT(*) as requests
            FROM weather.weather_requests
            WHERE request_timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY EXTRACT(hour FROM request_timestamp)
            ORDER BY hour
        `);

        res.json({
            success: true,
            data: {
                overview: {
                    ...statsQuery.rows[0],
                    ...recentStatsQuery.rows[0]
                },
                top_cities: topCitiesQuery.rows,
                hourly_activity: hourlyActivityQuery.rows
            }
        });

    } catch (error) {
        logger.error('Ошибка получения данных панели администратора:', error);
        res.status(500).json({
            error: 'Не удалось получить данные панели'
        });
    }
});

module.exports = router;