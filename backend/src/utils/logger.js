const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Определяем уровень логирования
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Создаем директорию для логов если её нет
const logDir = path.join(__dirname, '../../logs');

// Форматирование для вывода в консоль
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// Форматирование для файлов
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Настройка транспортов
const transports = [
    // Консольный вывод
    new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
        handleExceptions: true
    })
];

// Добавляем файловые транспорты только если не в тестовой среде
if (process.env.NODE_ENV !== 'test') {
    // Основной лог файл с ротацией
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info',
            format: fileFormat
        })
    );

    // Отдельный файл для ошибок
    transports.push(
        new DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: fileFormat
        })
    );

    // Отдельный файл для отладки (только в development)
    if (process.env.NODE_ENV === 'development') {
        transports.push(
            new DailyRotateFile({
                filename: path.join(logDir, 'debug-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '50m',
                maxFiles: '7d',
                level: 'debug',
                format: fileFormat
            })
        );
    }
}

// Создаем логгер
const logger = winston.createLogger({
    level: logLevel,
    transports,
    exitOnError: false,
    
    // Обработка необработанных исключений
    exceptionHandlers: process.env.NODE_ENV !== 'test' ? [
        new DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat
        })
    ] : [],

    // Обработка unhandled promise rejections
    rejectionHandlers: process.env.NODE_ENV !== 'test' ? [
        new DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: fileFormat
        })
    ] : []
});

// Создаем стрим для Morgan (HTTP логирование)
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Добавляем удобные методы для структурированного логирования
logger.logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
        logger.warn('HTTP Request Failed', logData);
    } else {
        logger.info('HTTP Request', logData);
    }
};

logger.logDatabaseQuery = (query, params, duration, error = null) => {
    const logData = {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        params: params?.length ? params : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
    };

    if (error) {
        logger.error('Database Query Failed', { ...logData, error: error.message });
    } else if (duration > 1000) {
        logger.warn('Slow Database Query', logData);
    } else {
        logger.debug('Database Query', logData);
    }
};

logger.logWeatherAPI = (city, provider, duration, cached = false, error = null) => {
    const logData = {
        city,
        provider,
        duration: `${duration}ms`,
        cached,
        timestamp: new Date().toISOString()
    };

    if (error) {
        logger.error('Weather API Request Failed', { ...logData, error: error.message });
    } else {
        logger.info('Weather API Request', logData);
    }
};

// Логирование запуска приложения
logger.info('Logger initialized', {
    level: logLevel,
    environment: process.env.NODE_ENV || 'development',
    logDir: process.env.NODE_ENV !== 'test' ? logDir : 'console only'
});

module.exports = logger;