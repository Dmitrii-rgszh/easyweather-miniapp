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
