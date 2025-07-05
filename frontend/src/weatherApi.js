const API_KEY = process.env.REACT_APP_WEATHER_API_KEY; // <-- твой рабочий ключ OpenWeather!

export async function fetchWeather(query) {
  let url = '';
  if (typeof query === 'string') {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&lang=ru&units=metric`;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&lang=ru&units=metric`;
  } else {
    throw new Error('Некорректный запрос');
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Город не найден или ошибка координат');
  return await res.json();
}

export async function fetchForecast(query) {
  let url = '';
  if (typeof query === 'string') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${API_KEY}&lang=ru&units=metric`;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&lang=ru&units=metric`;
  } else {
    throw new Error('Некорректный запрос');
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Не удалось получить прогноз');
  return await res.json();
}

// Функция получения качества воздуха
export async function fetchAirQuality(query) {
  let lat, lon;
  
  if (typeof query === 'string') {
    // Сначала получаем координаты города
    const weatherData = await fetchWeather(query);
    lat = weatherData.coord.lat;
    lon = weatherData.coord.lon;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    lat = query.lat;
    lon = query.lon;
  } else {
    throw new Error('Некорректный запрос');
  }

  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось получить данные о качестве воздуха');
    return await res.json();
  } catch (error) {
    console.error('Air quality error:', error);
    throw new Error('Ошибка получения качества воздуха');
  }
}

// Функция получения UV индекса (требует координаты)
export async function fetchUVIndex(query) {
  let lat, lon;
  
  if (typeof query === 'string') {
    // Сначала получаем координаты города
    const weatherData = await fetchWeather(query);
    lat = weatherData.coord.lat;
    lon = weatherData.coord.lon;
  } else if (typeof query === 'object' && query.lat && query.lon) {
    lat = query.lat;
    lon = query.lon;
  } else {
    throw new Error('Некорректный запрос');
  }

  const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось получить UV индекс');
    return await res.json();
  } catch (error) {
    console.error('UV index error:', error);
    throw new Error('Ошибка получения UV индекса');
  }
}