const express = require('express');
const router = express.Router();

// API ключ для погоды
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.REACT_APP_WEATHER_API_KEY;

console.log('🌤️ Weather router загружен');
console.log('🔑 Weather API Key:', WEATHER_API_KEY ? 'Настроен ✅' : 'НЕ НАЙДЕН ❌');

// Получение текущей погоды
router.post('/current', async (req, res) => {
  try {
    console.log('🌡️ Запрос текущей погоды получен:', req.body);
    
    const { city_name } = req.body;
    
    if (!city_name) {
      return res.status(400).json({
        success: false,
        error: 'Название города обязательно'
      });
    }

    if (!WEATHER_API_KEY) {
      console.error('❌ API ключ не найден');
      return res.status(500).json({
        success: false,
        error: 'API ключ не настроен'
      });
    }

    // 🌐 URL с units=metric для получения температуры в Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city_name)}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`;
    
    console.log('🌐 Запрос к OpenWeatherMap для города:', city_name);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Ошибка OpenWeatherMap API:', response.status);
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

// 🆕 Получение прогноза погоды (НОВЫЙ РОУТ)
router.post('/forecast', async (req, res) => {
  try {
    console.log('🔮 Запрос прогноза погоды получен:', req.body);
    
    const { city_name, days = 5 } = req.body;
    
    if (!city_name) {
      return res.status(400).json({
        success: false,
        error: 'Название города обязательно'
      });
    }

    if (!WEATHER_API_KEY) {
      console.error('❌ API ключ не найден');
      return res.status(500).json({
        success: false,
        error: 'API ключ не настроен'
      });
    }

    // 🌐 URL с units=metric для прогноза
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city_name)}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`;
    
    console.log('🔮 Запрос прогноза к OpenWeatherMap для города:', city_name);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Ошибка OpenWeatherMap API для прогноза:', response.status);
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

module.exports = router;