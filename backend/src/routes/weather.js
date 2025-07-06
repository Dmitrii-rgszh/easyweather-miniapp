const express = require('express');
const router = express.Router();

// Mock API для погоды (пока без реального API)
router.post('/current', async (req, res) => {
    try {
        console.log('📋 Получен запрос:', req.body);
        console.log('📋 Headers:', req.headers['content-type']);
        
        const { query, city_name, city } = req.body;
        const cityName = query || city_name || city || 'Москва';
        
        console.log('🌤️ Запрос погоды для:', cityName);
        console.log('🔍 query:', query);
        console.log('🔍 city_name:', city_name);  
        console.log('🔍 city:', city);
        
        // Простой mock ответ
        const mockWeatherData = {
            name: cityName,
            main: {
                temp: Math.floor(Math.random() * 20) + 10, // Случайная температура 10-30
                feels_like: Math.floor(Math.random() * 20) + 8,
                pressure: 1013,
                humidity: 65
            },
            weather: [{
                description: 'переменная облачность',
                icon: '02d'
            }],
            wind: {
                speed: 3.5
            },
            coord: {
                lat: 55.7558,
                lon: 37.6176
            }
        };

        // Возвращаем в формате который ожидает frontend
        res.json({
            success: true,
            data: mockWeatherData
        });
    } catch (error) {
        console.error('❌ Ошибка API погоды:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка получения данных о погоде' 
        });
    }
});

module.exports = router;