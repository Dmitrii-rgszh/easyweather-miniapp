const { Pool } = require('pg');
const path = require('path');

// Загружаем .env из корня проекта
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

console.log('🗄️ Настройка подключения к PostgreSQL...');
console.log('📡 Host:', process.env.POSTGRES_HOST);
console.log('📡 Port:', process.env.POSTGRES_PORT);
console.log('📡 Database:', process.env.POSTGRES_DB);
console.log('📡 User:', process.env.POSTGRES_USER);

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'easyweather',
  user: process.env.POSTGRES_USER || 'easyweather_user',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к PostgreSQL:', err);
});

// Функция для проверки здоровья БД
const checkDatabaseHealth = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    return {
      status: 'OK',
      timestamp: result.rows[0].current_time,
      database: process.env.POSTGRES_DB,
      version: result.rows[0].postgres_version,
      connection_pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    throw new Error(`Database health check failed: ${error.message}`);
  }
};

// Функция для создания таблиц
const initializeTables = async () => {
  try {
    const client = await pool.connect();
    
    // Создаем таблицу пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу запросов погоды
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_requests (
        id SERIAL PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100),
        temperature DECIMAL(5,2),
        description TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Таблицы базы данных инициализированы');
    client.release();
  } catch (error) {
    console.error('❌ Ошибка инициализации таблиц:', error);
    throw error;
  }
};

module.exports = {
  pool,
  checkDatabaseHealth,
  initializeTables
};