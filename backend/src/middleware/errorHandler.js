const logger = require('../utils/logger');

/**
 * Глобальный обработчик ошибок Express
 */
function errorHandler(err, req, res, next) {
    // Логируем ошибку
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Определяем тип ошибки и соответствующий HTTP статус
    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Ошибка валидации данных';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Не авторизован';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Доступ запрещен';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Ресурс не найден';
    } else if (err.code === '23505') { // PostgreSQL unique violation
        statusCode = 409;
        message = 'Конфликт данных';
    } else if (err.code === '23503') { // PostgreSQL foreign key violation
        statusCode = 400;
        message = 'Нарушение связности данных';
    }

    // В режиме разработки показываем детали ошибки
    const errorResponse = {
        error: message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    // Добавляем детали только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;