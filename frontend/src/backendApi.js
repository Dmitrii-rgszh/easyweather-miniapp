// Новый файл для подключения к вашему бэкенду
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Получение текущей погоды через ваш бэкенд
 */
export async function fetchWeatherFromBackend(city) {
  try {
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

    return result.data;
  } catch (error) {
    console.error('Backend API error:', error);
    throw new Error(`Ошибка API: ${error.message}`);
  }
}

/**
 * Получение прогноза погоды через ваш бэкенд
 */
export async function fetchForecastFromBackend(city, days = 5) {
  try {
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

    return result.data;
  } catch (error) {
    console.error('Backend forecast API error:', error);
    throw new Error(`Ошибка прогноза: ${error.message}`);
  }
}

/**
 * Проверка здоровья бэкенда
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
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