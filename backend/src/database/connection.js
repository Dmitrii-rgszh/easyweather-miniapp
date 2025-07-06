const { Pool } = require('pg');
const logger = require('../utils/logger');

// Конфигурация подключения к базе данных
const dbConfig = {
    // Основные параметры подключения
    host: process.env.DB_HOST || 'easyweather-postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'easyweather',
    user: process.env.DB_USER || 'easyweather_user',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    
    // Настройки пула соединений
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    min: parseInt(process.env.DB_MIN_CONNECTIONS) || 5,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
    
    // SSL настройки (для продакшена)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    
    // Дополнительные параметры
    application_name: 'easyweather-backend',
    statement_timeout: 60000, // 60 секунд
    query_timeout: 30000,     // 30 секунд
};

// Альтернативная конфигурация через DATABASE_URL
if (process.env.DATABASE_URL) {
    logger.info('Используется DATABASE_URL для подключения к БД');
} else {
    logger.info(`Подключение к БД: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
}

// Создание пула соединений
const pool = new Pool(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: dbConfig.ssl,
    max: dbConfig.max,
    min: dbConfig.min,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
    application_name: dbConfig.application_name
} : dbConfig);

// Обработчики событий пула
pool.on('connect', (client) => {
    logger.debug(`Новое подключение к БД (PID: ${client.processID})`);
});

pool.on('acquire', (client) => {
    logger.debug(`Клиент получен из пула (PID: ${client.processID})`);
});

pool.on('remove', (client) => {
    logger.debug(`Клиент удален из пула (PID: ${client.processID})`);
});

pool.on('error', (err, client) => {
    logger.error('Ошибка подключения к БД:', err);
});

// =================================
// ОСНОВНЫЕ ФУНКЦИИ
// =================================

/**
 * Тест подключения к базе данных
 */
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        
        logger.info('✅ Подключение к базе данных успешно');
        logger.info(`📅 Время сервера БД: ${result.rows[0].current_time}`);
        logger.debug(`🔧 Версия PostgreSQL: ${result.rows[0].version}`);
        
        client.release();
        return true;
    } catch (error) {
        logger.error('❌ Ошибка подключения к базе данных:', error.message);
        throw error;
    }
}

/**
 * Выполнение SQL запроса
 */
async function query(text, params = []) {
    const start = Date.now();
    
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        logger.debug(`Запрос выполнен за ${duration}мс: ${text.substring(0, 50)}...`);
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        logger.error(`Ошибка запроса (${duration}мс): ${error.message}`);
        logger.error(`SQL: ${text}`);
        logger.error(`Параметры: ${JSON.stringify(params)}`);
        throw error;
    }
}

/**
 * Получение клиента для транзакций
 */
async function getClient() {
    try {
        const client = await pool.connect();
        
        // Добавляем удобные методы
        client.query = async (text, params) => {
            const start = Date.now();
            try {
                const result = await client.query(text, params);
                const duration = Date.now() - start;
                logger.debug(`Транзакция: запрос выполнен за ${duration}мс`);
                return result;
            } catch (error) {
                logger.error(`Ошибка в транзакции: ${error.message}`);
                throw error;
            }
        };
        
        return client;
    } catch (error) {
        logger.error('Ошибка получения клиента для транзакции:', error);
        throw error;
    }
}

/**
 * Выполнение транзакции
 */
async function transaction(callback) {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        logger.debug('Транзакция начата');
        
        const result = await callback(client);
        
        await client.query('COMMIT');
        logger.debug('Транзакция зафиксирована');
        
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.warn('Транзакция отменена:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Получение статистики пула соединений
 */
function getPoolStats() {
    return {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        max: pool.options.max,
        min: pool.options.min
    };
}

/**
 * Проверка здоровья базы данных
 */
async function healthCheck() {
    try {
        const result = await query(`
            SELECT 
                COUNT(*) as active_connections,
                (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections,
                pg_size_pretty(pg_database_size(current_database())) as db_size
        `);
        
        const stats = getPoolStats();
        
        return {
            status: 'healthy',
            database: {
                connected: true,
                active_connections: parseInt(result.rows[0].active_connections),
                max_connections: parseInt(result.rows[0].max_connections),
                database_size: result.rows[0].db_size
            },
            pool: stats
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            database: {
                connected: false
            }
        };
    }
}

/**
 * Закрытие пула соединений
 */
async function close() {
    try {
        await pool.end();
        logger.info('Пул соединений с БД закрыт');
    } catch (error) {
        logger.error('Ошибка при закрытии пула соединений:', error);
        throw error;
    }
}

// =================================
// ЭКСПОРТ
// =================================

module.exports = {
    pool,
    query,
    getClient,
    transaction,
    testConnection,
    healthCheck,
    getPoolStats,
    close
};