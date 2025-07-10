const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🗄️ Инициализация базы данных SQLite
const dbPath = path.join(__dirname, 'weather.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err);
  } else {
    console.log('✅ Подключение к SQLite базе данных успешно');
  }
});

// 📊 Создание таблиц для аналитики и админов
db.serialize(() => {
  // Таблица для админов (если её нет)
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_super_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы admins:', err);
    } else {
      console.log('✅ Таблица admins готова');
    }
  });

  // Таблица для аналитики баннера
  db.run(`CREATE TABLE IF NOT EXISTS banner_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы banner_analytics:', err);
    } else {
      console.log('✅ Таблица banner_analytics готова');
    }
  });

  // Создаем индексы для быстрых запросов
  db.run(`CREATE INDEX IF NOT EXISTS idx_banner_clicks_date ON banner_analytics(clicked_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_banner_clicks_ip ON banner_analytics(user_ip)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_admins_telegram_id ON admins(telegram_id)`);

  // Добавляем тестовые данные для аналитики (можно удалить позже)
  db.run(`INSERT OR IGNORE INTO banner_analytics (id, clicked_at, user_ip, user_agent, session_id) VALUES 
    (1, '2025-07-10 10:30:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'test_session_1'),
    (2, '2025-07-10 11:15:00', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'test_session_2'),
    (3, '2025-07-10 12:45:00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', 'test_session_3')`);
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🛠️ Утилиты для аналитики
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'EasyWeather Backend is running!'
  });
});

// 🗄️ Health check для базы данных
app.get('/health/database', (req, res) => {
  db.get("SELECT datetime('now') as current_time", (err, row) => {
    if (err) {
      res.status(500).json({
        status: 'ERROR',
        database: 'disconnected',
        error: err.message
      });
    } else {
      res.json({
        status: 'OK',
        database: 'connected',
        current_time: row.current_time,
        message: 'Database connection is healthy'
      });
    }
  });
});

// API информация
app.get('/', (req, res) => {
  res.json({
    message: 'EasyWeather API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      analytics: '/api/analytics'
    }
  });
});

// 🎯 АНАЛИТИКА БАННЕРА
// POST /api/analytics/banner-click - Записать клик по баннеру
app.post('/api/analytics/banner-click', async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    const sessionId = req.body.sessionId || generateSessionId();
    
    console.log('🎯 Новый клик по баннеру:', {
      ip: clientIP,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    // Записываем в базу данных
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO banner_analytics (user_ip, user_agent, referrer, session_id) 
         VALUES (?, ?, ?, ?)`,
        [clientIP, userAgent, referrer, sessionId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, rowsAffected: this.changes });
          }
        }
      );
    });

    res.json({ 
      success: true, 
      message: 'Клик записан', 
      clickId: result.id,
      sessionId: sessionId 
    });

  } catch (error) {
    console.error('❌ Ошибка записи клика по баннеру:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при записи клика' 
    });
  }
});

// 📈 GET /api/analytics/banner-stats - Получить статистику кликов (только для админов)
app.get('/api/analytics/banner-stats', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }

    // Проверяем что пользователь - админ
    const adminCheck = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM admins WHERE telegram_id = ?',
        [parseInt(adminId)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Нет прав администратора' });
    }

    // Получаем общую статистику
    const totalClicks = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total FROM banner_analytics',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // Получаем последний клик
    const lastClick = await new Promise((resolve, reject) => {
      db.get(
        'SELECT clicked_at, user_ip FROM banner_analytics ORDER BY clicked_at DESC LIMIT 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Статистика по дням (последние 7 дней)
    const dailyStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(clicked_at) as date, 
           COUNT(*) as clicks
         FROM banner_analytics 
         WHERE clicked_at >= datetime('now', '-7 days')
         GROUP BY DATE(clicked_at)
         ORDER BY date DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Статистика по часам сегодня
    const hourlyStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           strftime('%H', clicked_at) as hour,
           COUNT(*) as clicks
         FROM banner_analytics 
         WHERE DATE(clicked_at) = DATE('now')
         GROUP BY strftime('%H', clicked_at)
         ORDER BY hour`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Уникальные IP за последние 24 часа
    const uniqueIPs = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT user_ip) as unique_ips
         FROM banner_analytics 
         WHERE clicked_at >= datetime('now', '-24 hours')`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row.unique_ips);
        }
      );
    });

    res.json({
      success: true,
      stats: {
        totalClicks: totalClicks,
        lastClick: lastClick ? {
          timestamp: lastClick.clicked_at,
          ip: lastClick.user_ip
        } : null,
        uniqueIPs24h: uniqueIPs,
        dailyStats: dailyStats,
        hourlyStats: hourlyStats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения статистики баннера:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при получении статистики' 
    });
  }
});

// 🗑️ DELETE /api/analytics/banner-reset - Сброс статистики (только для супер-админов)
app.delete('/api/analytics/banner-reset', async (req, res) => {
  try {
    const adminId = req.body.admin_id;
    
    // Проверяем права супер-админа
    const adminCheck = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM admins WHERE telegram_id = ? AND is_super_admin = 1',
        [parseInt(adminId)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!adminCheck) {
      return res.status(403).json({ 
        success: false, 
        error: 'Требуются права супер-администратора' 
      });
    }

    // Очищаем таблицу
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM banner_analytics', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🗑️ Статистика баннера сброшена админом:', adminCheck.username);

    res.json({ 
      success: true, 
      message: 'Статистика баннера успешно сброшена' 
    });

  } catch (error) {
    console.error('❌ Ошибка сброса статистики:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при сбросе статистики' 
    });
  }
});

// 👨‍💼 АДМИНСКИЕ ФУНКЦИИ
// POST /api/admin/check - Проверка прав администратора
app.post('/api/admin/check', async (req, res) => {
  try {
    const { telegram_id } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({
        success: false,
        error: 'Telegram ID обязателен'
      });
    }

    console.log('🔍 Проверка админских прав для ID:', telegram_id);

    const admin = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM admins WHERE telegram_id = ?',
        [parseInt(telegram_id)],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (admin) {
      console.log('✅ Админ найден:', admin.username);
      res.json({
        success: true,
        isAdmin: true,
        adminData: {
          telegram_id: admin.telegram_id,
          username: admin.username,
          first_name: admin.first_name,
          last_name: admin.last_name,
          is_super_admin: admin.is_super_admin
        }
      });
    } else {
      console.log('❌ Пользователь не является админом');
      res.json({
        success: true,
        isAdmin: false,
        adminData: null
      });
    }

  } catch (error) {
    console.error('❌ Ошибка проверки админа:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при проверке прав'
    });
  }
});

// 🆕 ПОГОДНЫЕ API РОУТЫ
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.REACT_APP_WEATHER_API_KEY;

// Получение текущей погоды
app.post('/api/weather/current', async (req, res) => {
  try {
    const { city_name } = req.body;
    
    if (!city_name) {
      return res.status(400).json({
        success: false,
        error: 'Название города обязательно'
      });
    }

    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API ключ не настроен'
      });
    }

    // 🌐 URL с units=metric для получения температуры в Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city_name)}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`;
    
    console.log('🌐 Запрос к OpenWeatherMap:', url.replace(WEATHER_API_KEY, '***'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 🌡️ Логируем температуру для отладки
    console.log('🌡️ Температура от API:', data.main.temp, '°C');
    console.log('🏙️ Город:', data.name);
    
    res.json({
      success: true,
      data: data,
      source: 'backend'
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения погоды:', error);
    res.status(500).json({
      success: false,
      error: `Ошибка получения данных: ${error.message}`
    });
  }
});

// Получение прогноза погоды
app.post('/api/weather/forecast', async (req, res) => {
  try {
    const { city_name, days = 5 } = req.body;
    
    if (!city_name) {
      return res.status(400).json({
        success: false,
        error: 'Название города обязательно'
      });
    }

    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API ключ не настроен'
      });
    }

    // 🌐 URL с units=metric для прогноза
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city_name)}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`;
    
    console.log('🔮 Запрос прогноза к OpenWeatherMap для:', city_name);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📊 Прогноз получен, количество записей:', data.list.length);
    
    res.json({
      success: true,
      data: data,
      source: 'backend'
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения прогноза:', error);
    res.status(500).json({
      success: false,
      error: `Ошибка получения прогноза: ${error.message}`
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 EasyWeather Backend запущен на порту ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database health: http://localhost:${PORT}/health/database`);
  console.log(`🎯 Analytics endpoints ready!`);
});

// Корректное закрытие базы данных при завершении приложения
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  db.close((err) => {
    if (err) {
      console.error('❌ Ошибка закрытия базы данных:', err);
    } else {
      console.log('✅ База данных закрыта');
    }
    process.exit(0);
  });
});

module.exports = app;