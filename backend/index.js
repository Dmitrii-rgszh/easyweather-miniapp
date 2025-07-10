const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'EasyWeather Backend is running!'
  });
});

// API информация
app.get('/', (req, res) => {
  res.json({
    message: 'EasyWeather API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
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
});

module.exports = app;