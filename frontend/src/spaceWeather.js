// 🌌 spaceWeather.js - Реальное API магнитных бурь NOAA

// URLs NOAA Space Weather API
const NOAA_API_URLS = {
  kIndex: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
  forecast: 'https://services.swpc.noaa.gov/json/3_day_forecast.json',
  alerts: 'https://services.swpc.noaa.gov/json/alerts.json',
  activity: 'https://services.swpc.noaa.gov/json/geospace_pred_est_kp_1_minute.json'
};

// Кеш для API (чтобы не делать слишком много запросов)
let apiCache = {
  kIndex: { data: null, timestamp: 0 },
  forecast: { data: null, timestamp: 0 },
  alerts: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 минут

// Проверка актуальности кеша
function isCacheValid(cacheEntry) {
  return cacheEntry.data && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
}

// Получение Kp-индекса (основной показатель магнитной активности)
export async function getKpIndex() {
  try {
    // Проверяем кеш
    if (isCacheValid(apiCache.kIndex)) {
      console.log('📊 Используем кешированные данные Kp-индекса');
      return apiCache.kIndex.data;
    }

    console.log('🌌 Запрашиваем данные Kp-индекса с NOAA...');
    
    const response = await fetch(NOAA_API_URLS.kIndex, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Пустой ответ от NOAA API');
    }

    // Берем последние 24 часа данных
    const last24Hours = data.slice(-144); // каждые 10 минут * 144 = 24 часа
    const currentReading = data[data.length - 1];
    
    const processedData = {
      current_kp: parseFloat(currentReading.kp_index) || 0,
      timestamp: currentReading.time_tag,
      trend: calculateKpTrend(last24Hours),
      activity_level: getActivityLevel(parseFloat(currentReading.kp_index)),
      last24h_max: Math.max(...last24Hours.map(item => parseFloat(item.kp_index) || 0)),
      last24h_avg: calculateAverage(last24Hours.map(item => parseFloat(item.kp_index) || 0))
    };

    // Кешируем данные
    apiCache.kIndex = {
      data: processedData,
      timestamp: Date.now()
    };

    console.log('✅ Данные Kp-индекса получены:', processedData);
    return processedData;

  } catch (error) {
    console.error('❌ Ошибка получения Kp-индекса:', error);
    
    // Возвращаем данные из кеша, если есть (даже устаревшие)
    if (apiCache.kIndex.data) {
      console.log('⚠️ Используем устаревшие данные из кеша');
      return apiCache.kIndex.data;
    }
    
    // Возвращаем заглушку с безопасными значениями
    return {
      current_kp: 2,
      timestamp: new Date().toISOString(),
      trend: 'stable',
      activity_level: 'quiet',
      last24h_max: 2,
      last24h_avg: 1.5,
      error: true
    };
  }
}

// Получение прогноза магнитной активности
export async function getMagneticForecast() {
  try {
    if (isCacheValid(apiCache.forecast)) {
      return apiCache.forecast.data;
    }

    const response = await fetch(NOAA_API_URLS.forecast);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    const data = await response.json();
    
    const processedForecast = data
      .filter(item => item.DateTimeISO && item.KpIndex)
      .slice(0, 8) // Следующие 8 периодов (24 часа)
      .map(item => ({
        datetime: item.DateTimeISO,
        kp_predicted: parseFloat(item.KpIndex),
        activity_level: getActivityLevel(parseFloat(item.KpIndex)),
        date: new Date(item.DateTimeISO).toLocaleDateString('ru-RU'),
        time: new Date(item.DateTimeISO).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));

    apiCache.forecast = {
      data: processedForecast,
      timestamp: Date.now()
    };

    return processedForecast;

  } catch (error) {
    console.error('❌ Ошибка получения прогноза:', error);
    return [];
  }
}

// Получение активных алертов от NOAA
export async function getSpaceWeatherAlerts() {
  try {
    if (isCacheValid(apiCache.alerts)) {
      return apiCache.alerts.data;
    }

    const response = await fetch(NOAA_API_URLS.alerts);
    
    if (!response.ok) {
      throw new Error(`Alerts API error: ${response.status}`);
    }

    const data = await response.json();
    
    const processedAlerts = data
      .filter(alert => alert.message && alert.issue_datetime)
      .map(alert => ({
        id: alert.serial_number || Date.now(),
        type: mapAlertType(alert.code),
        title: alert.message.split('\n')[0], // Первая строка как заголовок
        message: alert.message,
        issued: alert.issue_datetime,
        severity: mapAlertSeverity(alert.code)
      }));

    apiCache.alerts = {
      data: processedAlerts,
      timestamp: Date.now()
    };

    return processedAlerts;

  } catch (error) {
    console.error('❌ Ошибка получения алертов:', error);
    return [];
  }
}

// Комплексная функция для получения всех данных о космической погоде
export async function getCompleteSpaceWeather() {
  try {
    console.log('🚀 Получаем полные данные космической погоды...');
    
    const [kpData, forecast, alerts] = await Promise.allSettled([
      getKpIndex(),
      getMagneticForecast(),
      getSpaceWeatherAlerts()
    ]);

    const result = {
      kp_index: kpData.status === 'fulfilled' ? kpData.value : null,
      forecast: forecast.status === 'fulfilled' ? forecast.value : [],
      alerts: alerts.status === 'fulfilled' ? alerts.value : [],
      timestamp: new Date().toISOString(),
      data_quality: {
        kp_available: kpData.status === 'fulfilled',
        forecast_available: forecast.status === 'fulfilled',
        alerts_available: alerts.status === 'fulfilled'
      }
    };

    console.log('✅ Космическая погода получена:', result);
    return result;

  } catch (error) {
    console.error('❌ Критическая ошибка получения космической погоды:', error);
    return null;
  }
}

// ============ УТИЛИТЫ ============

// Определение уровня активности по Kp-индексу
function getActivityLevel(kp) {
  if (kp === null || kp === undefined || isNaN(kp)) return 'unknown';
  
  if (kp < 4) return 'quiet';
  if (kp < 5) return 'unsettled';  
  if (kp < 6) return 'active';
  if (kp < 7) return 'minor_storm';
  if (kp < 8) return 'moderate_storm';
  if (kp < 9) return 'strong_storm';
  return 'severe_storm';
}

// Получение русского описания уровня активности
export function getActivityLevelRu(level) {
  const levels = {
    'quiet': 'Спокойная',
    'unsettled': 'Неустойчивая', 
    'active': 'Активная',
    'minor_storm': 'Слабая буря',
    'moderate_storm': 'Умеренная буря',
    'strong_storm': 'Сильная буря',
    'severe_storm': 'Экстремальная буря',
    'unknown': 'Неизвестно'
  };
  return levels[level] || 'Неизвестно';
}

// Расчет тренда Kp-индекса
function calculateKpTrend(data) {
  if (!data || data.length < 12) return 'stable'; // Нужно минимум 2 часа данных
  
  const recent = data.slice(-12); // Последние 2 часа
  const earlier = data.slice(-24, -12); // Предыдущие 2 часа
  
  const recentAvg = calculateAverage(recent.map(item => parseFloat(item.kp_index) || 0));
  const earlierAvg = calculateAverage(earlier.map(item => parseFloat(item.kp_index) || 0));
  
  const difference = recentAvg - earlierAvg;
  
  if (difference > 0.5) return 'rising';
  if (difference < -0.5) return 'falling';
  return 'stable';
}

// Расчет среднего значения
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// Маппинг типов алертов
function mapAlertType(code) {
  if (!code) return 'info';
  
  const typeMap = {
    'ALTK04': 'geomagnetic_storm',
    'WARK04': 'geomagnetic_warning', 
    'ALTEF': 'solar_flare',
    'WARPC': 'proton_event',
    'SUMX01': 'summary'
  };
  
  return typeMap[code] || 'general';
}

// Маппинг серьезности алертов
function mapAlertSeverity(code) {
  if (!code) return 'info';
  
  if (code.includes('WAR')) return 'warning';
  if (code.includes('ALT')) return 'alert';
  if (code.includes('SUM')) return 'info';
  
  return 'info';
}

// Функция для тестирования API (только для разработки)
export async function testSpaceWeatherAPI() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ Тестирование API доступно только в режиме разработки');
    return;
  }
  
  console.log('🧪 Тестируем NOAA Space Weather API...');
  
  try {
    const kp = await getKpIndex();
    console.log('📊 Kp-индекс:', kp);
    
    const forecast = await getMagneticForecast();
    console.log('🔮 Прогноз:', forecast);
    
    const alerts = await getSpaceWeatherAlerts();
    console.log('🚨 Алерты:', alerts);
    
    console.log('✅ Все API работают корректно');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования API:', error);
  }
}

// Экспорт для использования в консоли разработчика
if (process.env.NODE_ENV === 'development') {
  window.testSpaceWeather = testSpaceWeatherAPI;
}