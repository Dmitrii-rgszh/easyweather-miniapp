const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Настройка PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'host.docker.internal',
  port: 5432,
  database: 'easyweather',
  user: 'easyweather_user',
  password: 'easyweather_secure_password_2024',
});

app.use(cors());
app.use(express.json());

// Проверка подключения к БД
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к PostgreSQL:', err);
  } else {
    console.log('✅ Подключение к PostgreSQL установлено');
    release();
  }
});

// Проверка статуса
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EasyWeather Admin API работает'
  });
});

// Генерация ссылки для входа
app.post('/api/admin/generate-login-link', async (req, res) => {
  try {
    const { telegram_id } = req.body;

    // Проверяем админа
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE telegram_id = $1 AND is_active = true',
      [telegram_id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ error: 'Не администратор' });
    }

    // Генерируем токен
    const tempToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await pool.query(
      'INSERT INTO admin_sessions (session_token, telegram_id, expires_at) VALUES ($1, $2, $3)',
      [tempToken, telegram_id, expiresAt]
    );

    const loginLink = `http://localhost:8080/admin?token=${tempToken}`;
    
    res.json({ 
      login_link: loginLink,
      expires_at: expiresAt,
      message: 'Ссылка действительна 10 минут'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход по токену
app.post('/api/admin/login', async (req, res) => {
  try {
    const { token } = req.body;

    const sessionResult = await pool.query(
      'SELECT telegram_id FROM admin_sessions WHERE session_token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    // Продлеваем сессию на 24 часа
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'UPDATE admin_sessions SET expires_at = $1 WHERE session_token = $2',
      [newExpiresAt, token]
    );

    res.json({ 
      token,
      expires_at: newExpiresAt,
      message: 'Успешный вход'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Admin API запущен на порту ${PORT}`);
});