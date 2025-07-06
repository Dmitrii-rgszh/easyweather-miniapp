const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const db = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'easyweather',
  user: 'easyweather_user',
  password: 'EasyWeather2025SecurePass!',
});

// Тест подключения к БД
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err);
  } else {
    console.log('✅ Подключение к БД успешно:', result.rows[0].now);
  }
});

// API endpoints
app.get('/', (req, res) => {
  res.json({ message: 'EasyWeather Backend API работает!' });
});

// Проверка подписки пользователя
app.get('/api/user/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const result = await db.query(
      'SELECT * FROM users.subscribers WHERE telegram_id = $1',
      [telegram_id]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ 
        telegram_id: telegram_id,
        subscription_type: 'free',
        message: 'Пользователь не найден' 
      });
    }
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка админа
app.get('/api/admin/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const result = await db.query(
      'SELECT * FROM users.admins WHERE telegram_id = $1 AND is_active = true',
      [telegram_id]
    );
    
    res.json({ 
      isAdmin: result.rows.length > 0,
      adminData: result.rows[0] || null
    });
  } catch (error) {
    console.error('Ошибка проверки админа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});