const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

// Строгое ограничение для аутентификации
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток за 15 минут
    message: {
        error: 'Слишком много попыток входа. Попробуйте через 15 минут.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Валидация для входа
 */
const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Имя пользователя обязательно')
        .isLength({ min: 3, max: 50 })
        .withMessage('Имя пользователя должно быть от 3 до 50 символов')
        .trim()
        .escape(),
    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен')
        .isLength({ min: 6 })
        .withMessage('Пароль должен быть минимум 6 символов')
];

/**
 * Генерация JWT токена
 */
function generateToken(admin) {
    const payload = {
        id: admin.id,
        username: admin.username,
        email: admin.email
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
        issuer: 'easyweather-api',
        audience: 'easyweather-admin'
    });
}

/**
 * Создание сессии в базе данных
 */
async function createSession(adminId, token, req) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 часа
    
    const result = await db.query(`
        INSERT INTO auth.admin_sessions 
        (admin_id, session_token, expires_at, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `, [
        adminId,
        token,
        expiresAt,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
    ]);
    
    return result.rows[0];
}

/**
 * POST /api/auth/login
 * Вход в систему
 */
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        // Проверяем валидацию
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: errors.array()
            });
        }

        const { username, password } = req.body;
        
        logger.info(`Попытка входа для пользователя: ${username}`);

        // Ищем администратора в базе данных
        const result = await db.query(`
            SELECT id, username, email, password_hash, salt, is_active, 
                   failed_login_attempts, locked_until
            FROM auth.admins 
            WHERE username = $1
        `, [username]);

        if (result.rows.length === 0) {
            logger.warn(`Попытка входа с несуществующим пользователем: ${username}`);
            return res.status(401).json({
                error: 'Неверные учетные данные'
            });
        }

        const admin = result.rows[0];

        // Проверяем, не заблокирован ли аккаунт
        if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
            logger.warn(`Попытка входа в заблокированный аккаунт: ${username}`);
            return res.status(423).json({
                error: 'Аккаунт временно заблокирован',
                locked_until: admin.locked_until
            });
        }

        // Проверяем, активен ли аккаунт
        if (!admin.is_active) {
            logger.warn(`Попытка входа в неактивный аккаунт: ${username}`);
            return res.status(403).json({
                error: 'Аккаунт деактивирован'
            });
        }

        // Проверяем пароль
        const passwordMatch = await bcrypt.compare(admin.salt + password, admin.password_hash);
        
        if (!passwordMatch) {
            // Увеличиваем счетчик неудачных попыток
            const newFailedAttempts = admin.failed_login_attempts + 1;
            let lockedUntil = null;
            
            // Блокируем аккаунт после 5 неудачных попыток на 30 минут
            if (newFailedAttempts >= 5) {
                lockedUntil = new Date();
                lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);
            }
            
            await db.query(`
                UPDATE auth.admins 
                SET failed_login_attempts = $1, locked_until = $2
                WHERE id = $3
            `, [newFailedAttempts, lockedUntil, admin.id]);
            
            logger.warn(`Неверный пароль для пользователя: ${username}. Попытка ${newFailedAttempts}/5`);
            
            return res.status(401).json({
                error: 'Неверные учетные данные',
                attempts_remaining: lockedUntil ? 0 : 5 - newFailedAttempts
            });
        }

        // Успешная аутентификация - сбрасываем счетчик попыток
        await db.query(`
            UPDATE auth.admins 
            SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW()
            WHERE id = $1
        `, [admin.id]);

        // Генерируем токен
        const token = generateToken(admin);
        
        // Создаем сессию
        await createSession(admin.id, token, req);
        
        logger.info(`Успешный вход пользователя: ${username}`);

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (error) {
        logger.error('Ошибка при входе в систему:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * POST /api/auth/logout
 * Выход из системы
 */
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Деактивируем сессию
            await db.query(`
                UPDATE auth.admin_sessions 
                SET is_active = false 
                WHERE session_token = $1
            `, [token]);
            
            logger.info('Пользователь вышел из системы');
        }

        res.json({
            success: true,
            message: 'Выход выполнен успешно'
        });

    } catch (error) {
        logger.error('Ошибка при выходе из системы:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * GET /api/auth/me
 * Получение информации о текущем пользователе
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Токен не предоставлен'
            });
        }

        // Проверяем токен
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({
                error: 'Недействительный токен'
            });
        }

        // Проверяем сессию в базе данных
        const sessionResult = await db.query(`
            SELECT s.id, s.expires_at, a.id as admin_id, a.username, a.email, a.is_active
            FROM auth.admin_sessions s
            JOIN auth.admins a ON s.admin_id = a.id
            WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()
        `, [token]);

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Сессия недействительна или истекла'
            });
        }

        const session = sessionResult.rows[0];

        if (!session.is_active) {
            return res.status(403).json({
                error: 'Аккаунт деактивирован'
            });
        }

        res.json({
            success: true,
            user: {
                id: session.admin_id,
                username: session.username,
                email: session.email
            },
            session: {
                expires_at: session.expires_at
            }
        });

    } catch (error) {
        logger.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Обновление токена
 */
router.post('/refresh', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Токен не предоставлен'
            });
        }

        // Проверяем сессию
        const sessionResult = await db.query(`
            SELECT s.admin_id, a.username, a.email, a.is_active
            FROM auth.admin_sessions s
            JOIN auth.admins a ON s.admin_id = a.id
            WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()
        `, [token]);

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Сессия недействительна или истекла'
            });
        }

        const admin = sessionResult.rows[0];

        if (!admin.is_active) {
            return res.status(403).json({
                error: 'Аккаунт деактивирован'
            });
        }

        // Генерируем новый токен
        const newToken = generateToken(admin);
        
        // Обновляем сессию
        await db.query(`
            UPDATE auth.admin_sessions 
            SET session_token = $1, expires_at = NOW() + INTERVAL '24 hours'
            WHERE session_token = $2
        `, [newToken, token]);

        res.json({
            success: true,
            token: newToken,
            message: 'Токен обновлен'
        });

    } catch (error) {
        logger.error('Ошибка при обновлении токена:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера'
        });
    }
});

module.exports = router;