const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');

// Проверка является ли пользователь админом
router.post('/check', async (req, res) => {
    try {
        const { telegram_id } = req.body;
        
        if (!telegram_id) {
            return res.status(400).json({
                success: false,
                error: 'Telegram ID обязателен'
            });
        }

        const result = await pool.query(
            'SELECT * FROM telegram_admins WHERE telegram_id = $1 AND is_active = true',
            [telegram_id]
        );

        const isAdmin = result.rows.length > 0;
        
        console.log('🔐 Проверка админа:', telegram_id, '→', isAdmin);
        
        res.json({
            success: true,
            isAdmin: isAdmin,
            adminData: isAdmin ? result.rows[0] : null
        });
    } catch (error) {
        console.error('❌ Ошибка проверки админа:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка проверки прав доступа'
        });
    }
});

// Получить список всех админов
router.get('/list', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT telegram_id, username, first_name, last_name, is_active, created_at FROM telegram_admins ORDER BY created_at'
        );
        
        res.json({
            success: true,
            admins: result.rows
        });
    } catch (error) {
        console.error('❌ Ошибка получения списка админов:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения данных'
        });
    }
});

module.exports = router;