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
    ip_address TEXT,
    page_url TEXT,
    click_coordinates TEXT,
    banner_id TEXT DEFAULT 'vtb_card',
    campaign_id TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы banner_analytics:', err);
    } else {
      console.log('✅ Таблица banner_analytics готова');
    }
  });
  // ===== НОВЫЕ ТАБЛИЦЫ ДЛЯ ТЕЛЕГРАМ АНАЛИТИКИ =====

  // 👤 Таблица пользователей бота
  db.run(`CREATE TABLE IF NOT EXISTS bot_users (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language_code TEXT DEFAULT 'ru',
    is_bot INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,
    first_start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_interactions INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы bot_users:', err);
    } else {
      console.log('✅ Таблица bot_users готова');
    }
  });

  // 🤖 События в телеграм боте
  db.run(`CREATE TABLE IF NOT EXISTS bot_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT,
    message_id INTEGER,
    chat_type TEXT DEFAULT 'private',
    command TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы bot_events:', err);
    } else {
      console.log('✅ Таблица bot_events готова');
    }
  });

  // 📱 Сессии Mini App
  db.run(`CREATE TABLE IF NOT EXISTS miniapp_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    user_agent TEXT,
    platform TEXT,
    referrer TEXT,
    init_data TEXT,
    query_id TEXT,
    is_active INTEGER DEFAULT 1,
    pages_visited INTEGER DEFAULT 1,
    actions_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы miniapp_sessions:', err);
    } else {
      console.log('✅ Таблица miniapp_sessions готова');
    }
  });

  // 📄 Действия пользователей в Mini App
  db.run(`CREATE TABLE IF NOT EXISTS miniapp_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    telegram_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    action_data TEXT,
    page_url TEXT,
    element_id TEXT,
    coordinates TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы miniapp_actions:', err);
    } else {
      console.log('✅ Таблица miniapp_actions готова');
    }
  });

  // 🎯 Воронка конверсий
  db.run(`CREATE TABLE IF NOT EXISTS conversion_funnel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    funnel_step TEXT NOT NULL,
    previous_step TEXT,
    step_data TEXT,
    time_from_previous INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы conversion_funnel:', err);
    } else {
      console.log('✅ Таблица conversion_funnel готова');
    }
  });

  // 📈 Дневная статистика
  db.run(`CREATE TABLE IF NOT EXISTS daily_stats (
    date DATE PRIMARY KEY,
    new_bot_users INTEGER DEFAULT 0,
    active_bot_users INTEGER DEFAULT 0,
    miniapp_sessions INTEGER DEFAULT 0,
    unique_miniapp_users INTEGER DEFAULT 0,
    total_miniapp_actions INTEGER DEFAULT 0,
    banner_clicks INTEGER DEFAULT 0,
    weather_searches INTEGER DEFAULT 0,
    avg_session_duration REAL DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы daily_stats:', err);
    } else {
      console.log('✅ Таблица daily_stats готова');
    }
  });
  
  // ===== МИГРАЦИЯ БАЗЫ ДАННЫХ =====
// Добавляем новые поля в существующую таблицу banner_analytics

console.log('🔄 Проверка и обновление структуры таблицы banner_analytics...');

// Функция безопасного добавления столбца
const addColumnSafely = (tableName, columnName, columnType, defaultValue = '') => {
  return new Promise((resolve) => {
    const defaultClause = defaultValue ? ` DEFAULT '${defaultValue}'` : '';
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}${defaultClause}`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column')) {
          console.log(`✅ Поле ${columnName} уже существует`);
        } else {
          console.log(`❌ Ошибка добавления поля ${columnName}:`, err.message);
        }
      } else {
        console.log(`✅ Поле ${columnName} добавлено успешно`);
      }
      resolve();
    });
  });
};

// Добавляем новые поля
db.serialize(async () => {
  await addColumnSafely('banner_analytics', 'ip_address', 'TEXT');
  await addColumnSafely('banner_analytics', 'page_url', 'TEXT');
  await addColumnSafely('banner_analytics', 'click_coordinates', 'TEXT');
  await addColumnSafely('banner_analytics', 'banner_id', 'TEXT', 'vtb_card');
  await addColumnSafely('banner_analytics', 'campaign_id', 'TEXT');
  await addColumnSafely('banner_analytics', 'user_id', 'TEXT');
  
  console.log('🎯 Миграция таблицы banner_analytics завершена');
});
  // ===== ИНДЕКСЫ =====
  
  // Существующие индексы
  db.run(`CREATE INDEX IF NOT EXISTS idx_banner_clicks_date ON banner_analytics(clicked_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_banner_clicks_ip ON banner_analytics(user_ip)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_admins_telegram_id ON admins(telegram_id)`);

  // Новые индексы для телеграм аналитики
  db.run(`CREATE INDEX IF NOT EXISTS idx_bot_users_first_start ON bot_users(first_start_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bot_users_last_activity ON bot_users(last_activity_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bot_events_telegram_id ON bot_events(telegram_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bot_events_type ON bot_events(event_type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bot_events_created_at ON bot_events(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_miniapp_sessions_telegram_id ON miniapp_sessions(telegram_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_miniapp_sessions_session_id ON miniapp_sessions(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_miniapp_actions_session_id ON miniapp_actions(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_miniapp_actions_type ON miniapp_actions(action_type)`);

  // ===== ТЕСТОВЫЕ ДАННЫЕ =====

  // Существующие тестовые данные для баннера
  db.run(`INSERT OR IGNORE INTO banner_analytics (id, clicked_at, user_ip, user_agent, session_id) VALUES 
    (1, '2025-07-10 10:30:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'test_session_1'),
    (2, '2025-07-10 11:15:00', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'test_session_2'),
    (3, '2025-07-10 12:45:00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', 'test_session_3')`);
  // Создаем индексы для быстрых запросов
  // Добавляем тестовые данные для аналитики (можно удалить позже)
  db.run(`INSERT OR IGNORE INTO banner_analytics (id, clicked_at, user_ip, user_agent, session_id) VALUES 
    (1, '2025-07-10 10:30:00', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'test_session_1'),
    (2, '2025-07-10 11:15:00', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'test_session_2'),
    (3, '2025-07-10 12:45:00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', 'test_session_3')`);

  // 👨‍💼 Добавляем себя в админы
  db.run(`INSERT OR IGNORE INTO admins (telegram_id, username, first_name, is_super_admin) VALUES 
    (5607311019, 'dmitry_poliakov', 'Дмитрий', 1)`, (err) => {
    if (err) {
      console.error('❌ Ошибка добавления админа:', err);
    } else {
      console.log('✅ Админ dmitry_poliakov добавлен в базу');
    }
  });
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

// ===== РАСШИРЕННАЯ АНАЛИТИКА БАННЕРА =====

// 🎯 POST /api/analytics/banner/click - Расширенное отслеживание кликов
app.post('/api/analytics/banner/click', async (req, res) => {
  try {
    const { 
      banner_id = 'vtb_card',
      click_coordinates,
      page_url,
      session_duration,
      user_id,
      campaign_id 
    } = req.body;

    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    
    console.log(`🎯 Клик по баннеру ${banner_id}:`, {
      ip: clientIP,
      coordinates: click_coordinates,
      page: page_url
    });

    // Записываем в базу данных с дополнительными полями
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO banner_analytics 
         (user_ip, user_agent, referrer, session_id, ip_address, page_url, click_coordinates, banner_id, campaign_id, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientIP, userAgent, referrer, 
         `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         clientIP, page_url, click_coordinates, banner_id, campaign_id, user_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, rowsAffected: this.changes });
        }
      );
    });

    res.json({ 
      success: true, 
      message: 'Клик по баннеру записан',
      click_id: result.id,
      banner_id: banner_id
    });

  } catch (error) {
    console.error('❌ Ошибка записи клика по баннеру:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при записи клика' 
    });
  }
});

// 📊 POST /api/analytics/banner/impression - Отслеживание показов баннера
app.post('/api/analytics/banner/impression', async (req, res) => {
  try {
    const { 
      banner_id = 'vtb_card',
      page_url,
      viewport_size,
      banner_position,
      session_id 
    } = req.body;

    const clientIP = getClientIP(req);
    
    console.log(`👁️ Показ баннера ${banner_id} на странице:`, page_url);

    // Создаем запись о показе
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO banner_analytics 
         (user_ip, user_agent, referrer, session_id, page_url, banner_id, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [clientIP, 'impression_tracking', '', session_id || generateSessionId(), page_url, banner_id, clientIP],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({ 
      success: true, 
      message: 'Показ баннера записан' 
    });

  } catch (error) {
    console.error('❌ Ошибка записи показа баннера:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при записи показа' 
    });
  }
});

// 📈 GET /api/analytics/banner/detailed-stats - Детальная статистика баннера
app.get('/api/analytics/banner/detailed-stats', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    const period = req.query.period || '7d'; // 1d, 7d, 30d, all
    const bannerId = req.query.banner_id || 'vtb_card';

    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }

    // Проверяем админские права
    const adminCheck = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE telegram_id = ?', [parseInt(adminId)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Нет прав администратора' });
    }

    // Определяем временной период
    let timeFilter = '';
    switch(period) {
      case '1d':
        timeFilter = "AND clicked_at >= datetime('now', '-1 day')";
        break;
      case '7d':
        timeFilter = "AND clicked_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        timeFilter = "AND clicked_at >= datetime('now', '-30 days')";
        break;
      default:
        timeFilter = '';
    }

    // Получаем общую статистику
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           COUNT(*) as total_clicks,
           COUNT(DISTINCT user_ip) as unique_users,
           COUNT(DISTINCT session_id) as unique_sessions,
           AVG(CASE WHEN user_agent != 'impression_tracking' THEN 1 ELSE 0 END) as click_rate
         FROM banner_analytics 
         WHERE 1=1 ${timeFilter}`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Статистика по часам
    const hourlyData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           strftime('%H', clicked_at) as hour,
           COUNT(*) as clicks,
           COUNT(DISTINCT user_ip) as unique_users
         FROM banner_analytics 
         WHERE user_agent != 'impression_tracking' ${timeFilter}
         GROUP BY strftime('%H', clicked_at)
         ORDER BY hour`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // География кликов (по IP)
    const geoData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           user_ip,
           COUNT(*) as clicks,
           MAX(clicked_at) as last_click
         FROM banner_analytics 
         WHERE user_agent != 'impression_tracking' ${timeFilter}
         GROUP BY user_ip
         ORDER BY clicks DESC
         LIMIT 20`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Устройства и браузеры
    const deviceData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           CASE 
             WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
             WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
             ELSE 'Desktop'
           END as device_type,
           COUNT(*) as clicks
         FROM banner_analytics 
         WHERE user_agent != 'impression_tracking' ${timeFilter}
         GROUP BY device_type`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Координаты кликов
    const clickCoordinates = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           click_coordinates,
           COUNT(*) as frequency
         FROM banner_analytics 
         WHERE click_coordinates IS NOT NULL AND click_coordinates != '' ${timeFilter}
         GROUP BY click_coordinates
         ORDER BY frequency DESC
         LIMIT 50`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      banner_id: bannerId,
      period: period,
      stats: {
        overview: stats,
        hourly: hourlyData,
        geography: geoData,
        devices: deviceData,
        click_coordinates: clickCoordinates,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения детальной статистики:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при получении статистики' 
    });
  }
});

// 🔧 GET /api/analytics/banner/conversion - Анализ конверсии баннера
app.get('/api/analytics/banner/conversion', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }

    // Проверяем права
    const adminCheck = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE telegram_id = ?', [parseInt(adminId)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Нет прав администратора' });
    }

    // Показы vs клики
    const impressions = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as total FROM banner_analytics WHERE user_agent = 'impression_tracking'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    const clicks = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as total FROM banner_analytics WHERE user_agent != 'impression_tracking'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // CTR по дням
    const dailyConversion = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(clicked_at) as date,
           COUNT(CASE WHEN user_agent = 'impression_tracking' THEN 1 END) as impressions,
           COUNT(CASE WHEN user_agent != 'impression_tracking' THEN 1 END) as clicks,
           ROUND(
             COUNT(CASE WHEN user_agent != 'impression_tracking' THEN 1 END) * 100.0 / 
             NULLIF(COUNT(CASE WHEN user_agent = 'impression_tracking' THEN 1 END), 0), 
             2
           ) as ctr
         FROM banner_analytics 
         WHERE clicked_at >= datetime('now', '-30 days')
         GROUP BY DATE(clicked_at)
         ORDER BY date DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const overallCTR = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      conversion: {
        total_impressions: impressions,
        total_clicks: clicks,
        overall_ctr: parseFloat(overallCTR),
        daily_conversion: dailyConversion,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка анализа конверсии:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при анализе конверсии' 
    });
  }
});

// 📊 GET /api/analytics/banner/heatmap - Тепловая карта кликов
app.get('/api/analytics/banner/heatmap', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }

    // Проверяем права
    const adminCheck = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE telegram_id = ?', [parseInt(adminId)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Нет прав администратора' });
    }

    // Получаем координаты кликов для тепловой карты
    const heatmapData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           click_coordinates,
           COUNT(*) as frequency,
           AVG(strftime('%s', clicked_at)) as avg_timestamp
         FROM banner_analytics 
         WHERE click_coordinates IS NOT NULL 
           AND click_coordinates != ''
           AND user_agent != 'impression_tracking'
         GROUP BY click_coordinates
         ORDER BY frequency DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            x: parseInt(row.click_coordinates.split(',')[0]) || 0,
            y: parseInt(row.click_coordinates.split(',')[1]) || 0,
            frequency: row.frequency,
            avg_timestamp: row.avg_timestamp
          })));
        }
      );
    });

    res.json({
      success: true,
      heatmap_data: heatmapData,
      total_clicks: heatmapData.reduce((sum, point) => sum + point.frequency, 0),
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ошибка получения тепловой карты:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера при получении тепловой карты' 
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

// 🚀 ДОБАВЬ ЭТИ ENDPOINTS В index.js ПОСЛЕ СУЩЕСТВУЮЩИХ API РОУТОВ

// ===== ТЕЛЕГРАМ БОТ АНАЛИТИКА =====

// 🤖 POST /api/bot/start - Пользователь нажал /start в боте
app.post('/api/bot/start', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, language_code, is_first_time } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'telegram_id обязателен' });
    }

    console.log('🤖 Старт бота для пользователя:', telegram_id);

    // Добавляем/обновляем пользователя
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO bot_users 
         (telegram_id, username, first_name, last_name, language_code, first_start_at, last_activity_at, total_interactions) 
         VALUES (?, ?, ?, ?, ?, 
                 COALESCE((SELECT first_start_at FROM bot_users WHERE telegram_id = ?), CURRENT_TIMESTAMP),
                 CURRENT_TIMESTAMP,
                 COALESCE((SELECT total_interactions FROM bot_users WHERE telegram_id = ?), 0) + 1)`,
        [telegram_id, username, first_name, last_name, language_code, telegram_id, telegram_id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    // Записываем событие старта
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bot_events (telegram_id, event_type, event_data, command) 
         VALUES (?, 'start', ?, '/start')`,
        [telegram_id, JSON.stringify({ is_first_time, username, first_name })],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Добавляем в воронку конверсий
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO conversion_funnel (telegram_id, funnel_step, step_data) 
         VALUES (?, 'bot_start', ?)`,
        [telegram_id, JSON.stringify({ is_first_time })],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({ success: true, message: 'Старт бота записан' });

  } catch (error) {
    console.error('❌ Ошибка записи старта бота:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 🎯 POST /api/bot/event - Любое событие в боте
app.post('/api/bot/event', async (req, res) => {
  try {
    const { telegram_id, event_type, event_data, command, message_id } = req.body;
    
    if (!telegram_id || !event_type) {
      return res.status(400).json({ success: false, error: 'telegram_id и event_type обязательны' });
    }

    console.log('🎯 Событие в боте:', event_type, 'для пользователя:', telegram_id);

    // Обновляем активность пользователя
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE bot_users 
         SET last_activity_at = CURRENT_TIMESTAMP, 
             total_interactions = total_interactions + 1
         WHERE telegram_id = ?`,
        [telegram_id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    // Записываем событие
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bot_events (telegram_id, event_type, event_data, command, message_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [telegram_id, event_type, JSON.stringify(event_data), command, message_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({ success: true, message: 'Событие записано' });

  } catch (error) {
    console.error('❌ Ошибка записи события бота:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ===== MINI APP АНАЛИТИКА =====

// 📱 POST /api/miniapp/session-start - Пользователь открыл Mini App
app.post('/api/miniapp/session-start', async (req, res) => {
  try {
    const { telegram_id, session_id, init_data, query_id, platform } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    
    if (!telegram_id || !session_id) {
      return res.status(400).json({ success: false, error: 'telegram_id и session_id обязательны' });
    }

    console.log('📱 Новая сессия Mini App:', session_id, 'для пользователя:', telegram_id);

    // Создаем новую сессию
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO miniapp_sessions 
         (telegram_id, session_id, user_agent, platform, referrer, init_data, query_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [telegram_id, session_id, userAgent, platform, referrer, init_data, query_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Записываем событие открытия Mini App в бот
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bot_events (telegram_id, event_type, event_data) 
         VALUES (?, 'miniapp_open', ?)`,
        [telegram_id, JSON.stringify({ session_id, platform, referrer })],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Добавляем в воронку конверсий
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO conversion_funnel (telegram_id, funnel_step, previous_step, step_data, time_from_previous) 
         VALUES (?, 'miniapp_open', 'bot_start', ?, 
                 COALESCE((strftime('%s', 'now') - strftime('%s', (
                   SELECT created_at FROM conversion_funnel 
                   WHERE telegram_id = ? AND funnel_step = 'bot_start' 
                   ORDER BY created_at DESC LIMIT 1
                 ))), 0))`,
        [telegram_id, JSON.stringify({ session_id, platform }), telegram_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({ success: true, message: 'Сессия Mini App создана' });

  } catch (error) {
    console.error('❌ Ошибка создания сессии Mini App:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 🎬 POST /api/miniapp/action - Действие пользователя в Mini App
app.post('/api/miniapp/action', async (req, res) => {
  try {
    const { telegram_id, session_id, action_type, action_data, page_url, element_id } = req.body;
    
    if (!telegram_id || !session_id || !action_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'telegram_id, session_id и action_type обязательны' 
      });
    }

    console.log('🎬 Действие в Mini App:', action_type, 'в сессии:', session_id);

    // Записываем действие
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO miniapp_actions 
         (telegram_id, session_id, action_type, action_data, page_url, element_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [telegram_id, session_id, action_type, JSON.stringify(action_data), page_url, element_id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Обновляем активность сессии
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE miniapp_sessions 
         SET last_activity = CURRENT_TIMESTAMP, 
             actions_count = actions_count + 1
         WHERE session_id = ?`,
        [session_id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    // Если это важное действие, добавляем в воронку
    if (['weather_search', 'banner_view', 'banner_click', 'profile_update'].includes(action_type)) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO conversion_funnel (telegram_id, funnel_step, previous_step, step_data, time_from_previous) 
           VALUES (?, ?, 'miniapp_open', ?, 
                   COALESCE((strftime('%s', 'now') - strftime('%s', (
                     SELECT created_at FROM conversion_funnel 
                     WHERE telegram_id = ? AND funnel_step = 'miniapp_open' 
                     ORDER BY created_at DESC LIMIT 1
                   ))), 0))`,
          [telegram_id, action_type, JSON.stringify(action_data), telegram_id],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
    }

    res.json({ success: true, message: 'Действие записано' });

  } catch (error) {
    console.error('❌ Ошибка записи действия Mini App:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ⏰ POST /api/miniapp/session-end - Пользователь закрыл Mini App
app.post('/api/miniapp/session-end', async (req, res) => {
  try {
    const { session_id, duration_seconds } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id обязателен' });
    }

    console.log('⏰ Завершение сессии Mini App:', session_id);

    // Обновляем сессию
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE miniapp_sessions 
         SET end_time = CURRENT_TIMESTAMP, 
             duration_seconds = ?,
             is_active = 0
         WHERE session_id = ?`,
        [duration_seconds, session_id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    res.json({ success: true, message: 'Сессия завершена' });

  } catch (error) {
    console.error('❌ Ошибка завершения сессии:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 📊 GET /api/analytics/telegram-stats - Статистика для админов
app.get('/api/analytics/telegram-stats', async (req, res) => {
  try {
    const adminId = req.query.admin_id;
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }

    // Проверяем админа
    const adminCheck = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE telegram_id = ?', [parseInt(adminId)], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Нет прав администратора' });
    }

    // Общая статистика
    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM bot_users', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    const totalSessions = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM miniapp_sessions', (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    const activeSessions = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as active FROM miniapp_sessions WHERE is_active = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.active);
      });
    });

    const todayUsers = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as today FROM bot_users 
         WHERE DATE(last_activity_at) = DATE('now')`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row.today);
        }
      );
    });

    const avgSessionDuration = await new Promise((resolve, reject) => {
      db.get(
        `SELECT AVG(duration_seconds) as avg_duration FROM miniapp_sessions 
         WHERE duration_seconds > 0`,
        (err, row) => {
          if (err) reject(err);
          else resolve(Math.round(row.avg_duration || 0));
        }
      );
    });

    // Статистика по дням (последние 7 дней)
    const dailyStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as new_users
         FROM bot_users 
         WHERE created_at >= datetime('now', '-7 days')
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Топ действий в Mini App
    const topActions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           action_type,
           COUNT(*) as count
         FROM miniapp_actions 
         GROUP BY action_type
         ORDER BY count DESC
         LIMIT 10`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSessions,
        activeSessions,
        todayUsers,
        avgSessionDuration,
        dailyStats,
        topActions,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения телеграм статистики:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
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