// Основной API для работы с бэкендом + кэширование
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// 🆕 СИСТЕМА КЭШИРОВАНИЯ
const backendCache = {
  weather: {},
  forecast: {},
  health: null
};

// Время жизни кэша
const CACHE_DURATION = {
  weather: 5 * 60 * 1000,      // 5 минут для погоды
  forecast: 30 * 60 * 1000,    // 30 минут для прогноза
  health: 60 * 1000            // 1 минута для health check
};

// Функция для создания ключа кэша
function createCacheKey(city) {
  return city.toLowerCase().trim();
}

// Функция проверки актуальности кэша
function isCacheValid(cacheEntry, maxAge) {
  return cacheEntry && 
         cacheEntry.timestamp && 
         (Date.now() - cacheEntry.timestamp) < maxAge;
}

/**
 * Получение текущей погоды через ваш бэкенд (с кэшированием)
 */
export async function fetchWeatherFromBackend(city) {
  const cacheKey = createCacheKey(city);
  
  // Проверяем кэш
  if (isCacheValid(backendCache.weather[cacheKey], CACHE_DURATION.weather)) {
    console.log('🎯 Используем кэшированные данные с бэкенда для:', cacheKey);
    return backendCache.weather[cacheKey].data;
  }

  try {
    console.log('🌐 Запрос к бэкенду для:', cacheKey);
    
    const response = await fetch(`${API_BASE_URL}/api/weather/current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city_name: city
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка получения данных');
    }

    // Сохраняем в кэш
    backendCache.weather[cacheKey] = {
      data: result.data,
      timestamp: Date.now()
    };

    console.log(`✅ Данные получены и закэшированы для: ${cacheKey} (источник: ${result.source || 'backend'})`);
    return result.data;
    
  } catch (error) {
    console.error('Backend API error:', error);
    throw new Error(`Ошибка API: ${error.message}`);
  }
}

/**
 * Получение прогноза погоды через ваш бэкенд (с кэшированием)
 */
export async function fetchForecastFromBackend(city, days = 5) {
  const cacheKey = `${createCacheKey(city)}_${days}`;
  
  // Проверяем кэш
  if (isCacheValid(backendCache.forecast[cacheKey], CACHE_DURATION.forecast)) {
    console.log('🎯 Используем кэшированный прогноз с бэкенда для:', cacheKey);
    return backendCache.forecast[cacheKey].data;
  }

  try {
    console.log('🌐 Запрос прогноза к бэкенду для:', cacheKey);
    
    const response = await fetch(`${API_BASE_URL}/api/weather/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city_name: city,
        days: days
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка получения прогноза');
    }

    // Сохраняем в кэш
    backendCache.forecast[cacheKey] = {
      data: result.data,
      timestamp: Date.now()
    };

    return result.data;
    
  } catch (error) {
    console.error('Backend forecast API error:', error);
    throw new Error(`Ошибка прогноза: ${error.message}`);
  }
}

/**
 * Проверка здоровья бэкенда (с кэшированием)
 */
export async function checkBackendHealth() {
  // Проверяем кэш
  if (isCacheValid(backendCache.health, CACHE_DURATION.health)) {
    return backendCache.health.data;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const isHealthy = response.ok;
    
    // Кэшируем результат
    backendCache.health = {
      data: isHealthy,
      timestamp: Date.now()
    };
    
    console.log('🏥 Статус бэкенда:', isHealthy ? 'Здоров' : 'Недоступен');
    return isHealthy;
  } catch (error) {
    console.error('Backend health check failed:', error);
    
    // Кэшируем отрицательный результат на короткое время
    backendCache.health = {
      data: false,
      timestamp: Date.now()
    };
    
    return false;
  }
}

/**
 * Получение статистики (для админки)
 */
export async function getWeatherStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Stats API error:', error);
    throw error;
  }
}

/**
 * Аутентификация администратора
 */
export async function loginAdmin(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка входа');
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// 🆕 ФУНКЦИЯ ОЧИСТКИ УСТАРЕВШЕГО КЭША
export function clearOldBackendCache() {
  const now = Date.now();
  
  // Очищаем кэш погоды
  Object.keys(backendCache.weather).forEach(key => {
    if (!isCacheValid(backendCache.weather[key], CACHE_DURATION.weather)) {
      delete backendCache.weather[key];
    }
  });
  
  // Очищаем кэш прогнозов
  Object.keys(backendCache.forecast).forEach(key => {
    if (!isCacheValid(backendCache.forecast[key], CACHE_DURATION.forecast)) {
      delete backendCache.forecast[key];
    }
  });
  
  // Очищаем кэш health check
  if (!isCacheValid(backendCache.health, CACHE_DURATION.health)) {
    backendCache.health = null;
  }
  
  console.log('🧹 Устаревший кэш бэкенда очищен');
}

// 🆕 ФУНКЦИЯ ПРИНУДИТЕЛЬНОЙ ОЧИСТКИ КЭША (для разработки)
export function clearAllBackendCache() {
  backendCache.weather = {};
  backendCache.forecast = {};
  backendCache.health = null;
  console.log('🧹 Весь кэш бэкенда очищен');
}

// 🆕 ФУНКЦИЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О КЭШЕ (для отладки)
export function getBackendCacheInfo() {
  const info = {
    weather: Object.keys(backendCache.weather).length,
    forecast: Object.keys(backendCache.forecast).length,
    health: backendCache.health ? 'cached' : 'not cached'
  };
  console.log('📊 Информация о кэше бэкенда:', info);
  return info;
}

// Автоматическая очистка кэша каждые 5 минут
if (typeof window !== 'undefined') {
  setInterval(clearOldBackendCache, 5 * 60 * 1000);
  
  // Добавляем функции в window для отладки в development режиме
  if (process.env.NODE_ENV === 'development') {
    window.clearBackendCache = clearAllBackendCache;
    window.getBackendCacheInfo = getBackendCacheInfo;
    window.checkBackend = checkBackendHealth;
  }
}