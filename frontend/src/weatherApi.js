const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// 🆕 СИСТЕМА КЭШИРОВАНИЯ
const weatherCache = {
  current: {},
  forecast: {},
  airQuality: {},
  uvIndex: {}
};

// Время жизни кэша (5 минут для текущей погоды)
const CACHE_DURATION = {
  current: 5 * 60 * 1000,      // 5 минут
  forecast: 30 * 60 * 1000,    // 30 минут
  airQuality: 30 * 60 * 1000,  // 30 минут
  uvIndex: 30 * 60 * 1000      // 30 минут
};

// Функция для создания ключа кэша
function createCacheKey(query) {
  if (typeof query === 'string') {
    return query.toLowerCase().trim();
  } else if (typeof query === 'object' && query.lat && query.lon) {
    // Округляем координаты до 2 знаков для стабильности кэша
    return `${Math.round(query.lat * 100) / 100},${Math.round(query.lon * 100) / 100}`;
  }
  return 'unknown';
}

// Функция проверки актуальности кэша
function isCacheValid(cacheEntry, maxAge) {
  return cacheEntry && 
         cacheEntry.timestamp && 
         (Date.now() - cacheEntry.timestamp) < maxAge;
}

// 🔧 ИСПРАВЛЕННАЯ функция получения текущей погоды
export async function fetchWeather(query) {
  const cacheKey = createCacheKey(query);
  
  // Проверяем кэш
  if (isCacheValid(weatherCache.current[cacheKey], CACHE_DURATION.current)) {
    console.log('🎯 Используем кэшированные данные погоды для:', cacheKey);
    return weatherCache.current[cacheKey].data;
  }

  let url = '';
  if (typeof query === 'string') {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&lang=ru&units=metric`;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&lang=ru&units=metric`;
  } else {
    throw new Error('Некорректный запрос');
  }

  console.log('🌐 Запрос к API для:', cacheKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Город не найден или ошибка координат');
  
  const data = await res.json();
  
  // Сохраняем в кэш
  weatherCache.current[cacheKey] = {
    data: data,
    timestamp: Date.now()
  };
  
  return data;
}

// 🔧 ИСПРАВЛЕННАЯ функция получения прогноза
export async function fetchForecast(query) {
  const cacheKey = createCacheKey(query);
  
  // Проверяем кэш
  if (isCacheValid(weatherCache.forecast[cacheKey], CACHE_DURATION.forecast)) {
    console.log('🎯 Используем кэшированный прогноз для:', cacheKey);
    return weatherCache.forecast[cacheKey].data;
  }

  let url = '';
  if (typeof query === 'string') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${API_KEY}&lang=ru&units=metric`;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&lang=ru&units=metric`;
  } else {
    throw new Error('Некорректный запрос');
  }

  console.log('🌐 Запрос прогноза к API для:', cacheKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не удалось получить прогноз');
  
  const data = await res.json();
  
  // Сохраняем в кэш
  weatherCache.forecast[cacheKey] = {
    data: data,
    timestamp: Date.now()
  };
  
  return data;
}

// 🔧 ИСПРАВЛЕННАЯ функция получения качества воздуха
export async function fetchAirQuality(query) {
  let lat, lon;
  
  if (typeof query === 'string') {
    // Сначала получаем координаты города (с кэшированием)
    const weatherData = await fetchWeather(query);
    lat = weatherData.coord.lat;
    lon = weatherData.coord.lon;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    lat = query.lat;
    lon = query.lon;
  } else {
    throw new Error('Некорректный запрос');
  }

  const cacheKey = `${Math.round(lat * 100) / 100},${Math.round(lon * 100) / 100}`;
  
  // Проверяем кэш
  if (isCacheValid(weatherCache.airQuality[cacheKey], CACHE_DURATION.airQuality)) {
    console.log('🎯 Используем кэшированное качество воздуха для:', cacheKey);
    return weatherCache.airQuality[cacheKey].data;
  }

  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  try {
    console.log('🌐 Запрос качества воздуха к API для:', cacheKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось получить данные о качестве воздуха');
    
    const data = await res.json();
    
    // Сохраняем в кэш
    weatherCache.airQuality[cacheKey] = {
      data: data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error('Air quality error:', error);
    throw new Error('Ошибка получения качества воздуха');
  }
}

// 🔧 ИСПРАВЛЕННАЯ функция получения UV индекса  
export async function fetchUVIndex(query) {
  let lat, lon;
  
  if (typeof query === 'string') {
    // Сначала получаем координаты города (с кэшированием)
    const weatherData = await fetchWeather(query);
    lat = weatherData.coord.lat;
    lon = weatherData.coord.lon;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    lat = query.lat;
    lon = query.lon;
  } else {
    throw new Error('Некорректный запрос');
  }

  const cacheKey = `${Math.round(lat * 100) / 100},${Math.round(lon * 100) / 100}`;
  
  // Проверяем кэш
  if (isCacheValid(weatherCache.uvIndex[cacheKey], CACHE_DURATION.uvIndex)) {
    console.log('🎯 Используем кэшированный UV индекс для:', cacheKey);
    return weatherCache.uvIndex[cacheKey].data;
  }

  const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  try {
    console.log('🌐 Запрос UV индекса к API для:', cacheKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось получить UV индекс');
    
    const data = await res.json();
    
    // 🔧 ЗАВЕРШАЕМ ОБРЕЗАННУЮ ЧАСТЬ
    // Сохраняем в кэш
    weatherCache.uvIndex[cacheKey] = {
      data: data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error('UV index error:', error);
    throw new Error('Ошибка получения UV индекса');
  }
}

// 🆕 ФУНКЦИЯ ОЧИСТКИ УСТАРЕВШЕГО КЭША
export function clearOldCache() {
  const now = Date.now();
  
  Object.keys(weatherCache).forEach(cacheType => {
    const maxAge = CACHE_DURATION[cacheType] || CACHE_DURATION.current;
    
    Object.keys(weatherCache[cacheType]).forEach(key => {
      if (!isCacheValid(weatherCache[cacheType][key], maxAge)) {
        delete weatherCache[cacheType][key];
      }
    });
  });
  
  console.log('🧹 Устаревший кэш очищен');
}

// 🆕 ФУНКЦИЯ ПРИНУДИТЕЛЬНОЙ ОЧИСТКИ КЭША (для разработки)
export function clearAllCache() {
  Object.keys(weatherCache).forEach(cacheType => {
    weatherCache[cacheType] = {};
  });
  console.log('🧹 Весь кэш очищен');
}

// Автоматическая очистка кэша каждые 10 минут
if (typeof window !== 'undefined') {
  setInterval(clearOldCache, 10 * 60 * 1000);
}