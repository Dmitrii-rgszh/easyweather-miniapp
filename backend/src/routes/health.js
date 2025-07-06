const express = require('express');
const db = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /health
 * Проверка здоровья системы
 */
router.get('/', async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Проверка базы данных
        const dbHealth = await db.healthCheck();
        
        // Системная информация
        const systemInfo = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            version: process.version,
            platform: process.platform
        };
        
        const responseTime = Date.now() - startTime;
        
        const healthStatus = {
            status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: systemInfo.uptime,
            response_time_ms: responseTime,
            services: {
                database: dbHealth,
                api: {
                    status: 'healthy',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development'
                }
            },
            system: {
                memory: {
                    used: Math.round(systemInfo.memory.heapUsed / 1024 / 1024),
                    total: Math.round(systemInfo.memory.heapTotal / 1024 / 1024),
                    external: Math.round(systemInfo.memory.external / 1024 / 1024),
                    unit: 'MB'
                },
                platform: systemInfo.platform,
                node_version: systemInfo.version
            }
        };
        
        // Определяем HTTP статус
        const httpStatus = healthStatus.status === 'healthy' ? 200 : 503;
        
        res.status(httpStatus).json(healthStatus);
        
        // Логируем только если есть проблемы
        if (httpStatus !== 200) {
            logger.warn('Health check failed', { healthStatus });
        }
        
    } catch (error) {
        logger.error('Health check error:', error);
        
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                database: {
                    status: 'unknown',
                    error: error.message
                },
                api: {
                    status: 'unhealthy'
                }
            }
        });
    }
});

/**
 * GET /health/database
 * Детальная проверка базы данных
 */
router.get('/database', async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Проверка подключения
        await db.testConnection();
        
        // Получение статистики
        const poolStats = db.getPoolStats();
        
        // Проверка схемы базы данных
        const schemaCheck = await db.query(`
            SELECT 
                schemaname,
                COUNT(*) as table_count
            FROM pg_tables 
            WHERE schemaname IN ('auth', 'weather', 'logs', 'public')
            GROUP BY schemaname
            ORDER BY schemaname
        `);
        
        // Проверка размера таблиц
        const tableStats = await db.query(`
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_stat_get_tuples_inserted(c.oid) as inserts,
                pg_stat_get_tuples_updated(c.oid) as updates,
                pg_stat_get_tuples_deleted(c.oid) as deletes
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE schemaname IN ('auth', 'weather', 'logs')
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10
        `);
        
        const responseTime = Date.now() - startTime;
        
        res.json({
            status: 'healthy',
            response_time_ms: responseTime,
            connection_pool: poolStats,
            schemas: schemaCheck.rows,
            tables: tableStats.rows,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Database health check error:', error);
        
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /health/ready
 * Проверка готовности к приему запросов
 */
router.get('/ready', async (req, res) => {
    try {
        // Быстрая проверка основных сервисов
        await db.query('SELECT 1');
        
        res.json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Readiness check failed:', error);
        
        res.status(503).json({
            status: 'not_ready',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /health/live
 * Простейшая проверка жизнеспособности
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;