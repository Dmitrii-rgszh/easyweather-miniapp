// Обновленный App.js с WeatherCarousel и системой передачи данных всем блокам

import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import AdBanner from "./AdBanner";
import WeatherCarousel from "./WeatherCarousel"; // 🆕 НОВЫЙ КОМПОНЕНТ
import CityDateInput from "./CityDateInput";
import ClothingRecommendations from "./ClothingRecommendations";
import QuickActions from "./QuickActions";
import AirQuality from "./AirQuality";
import UVIndex from "./UVIndex";
import WeatherAlerts from "./WeatherAlerts";
import { fetchWeather, fetchForecast, fetchAirQuality, fetchUVIndex } from "./weatherApi";
import { getCityByCoords } from "./geoApi";
import Astronomy from "./Astronomy";
import WeatherTrends from "./WeatherTrends";
import { 
  fetchWeatherFromBackend, 
  checkBackendHealth 
} from './backendApi';

// Все эффекты остаются без изменений
function CloudsEffect() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${i * 24 + 7}%`,
            top: `${40 + i * 18}px`,
            width: 110 + i * 32,
            height: 42 + i * 19,
            background: "rgba(255,255,255,0.60)",
            borderRadius: "50%",
            filter: "blur(14px)",
            opacity: 0.58 - i * 0.1,
            zIndex: 99,
            pointerEvents: "none"
          }}
          animate={{
            x: [0, 28 + i * 11, 0]
          }}
          transition={{
            duration: 29 + i * 6,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
    </>
  );
}

function RainEffect() {
  return (
    <>
      {[...Array(18)].map((_, i) => {
        const isGlow = i % 3 === 0;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${6 + Math.random() * 88}%`,
              top: `${-24 + Math.random() * 18}%`,
              width: 8 + Math.random() * 9,
              height: 28 + Math.random() * 20,
              background: isGlow
                ? "linear-gradient(180deg,#60a5fa88 0%,#38bdf8bb 100%)"
                : "rgba(92,160,240,0.20)",
              borderRadius: "40%",
              filter: isGlow ? "blur(3px)" : "blur(1.1px)",
              boxShadow: isGlow ? "0 0 16px 3px #38bdf8aa" : undefined,
              opacity: isGlow ? 0.5 : 0.32,
              zIndex: 99,
              pointerEvents: "none"
            }}
            animate={{
              y: ["0%", "128%"],
              opacity: [0.45, 0.63, 0]
            }}
            transition={{
              duration: 2.8 + Math.random() * 2.7,
              repeat: Infinity,
              delay: i * 0.23
            }}
          />
        );
      })}
    </>
  );
}

function SnowEffect() {
  return (
    <>
      {[...Array(20)].map((_, i) => {
        const isLight = i % 4 === 0;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${2 + Math.random() * 95}%`,
              top: `${-14 + Math.random() * 14}%`,
              width: isLight ? 9 : 13 + Math.random() * 8,
              height: isLight ? 9 : 13 + Math.random() * 8,
              background: isLight
                ? "rgba(255,255,255,0.85)"
                : "rgba(255,255,255,0.65)",
              borderRadius: "50%",
              filter: isLight ? "blur(2px)" : "blur(3px)",
              opacity: isLight ? 0.7 : 0.5,
              zIndex: 99,
              pointerEvents: "none"
            }}
            animate={{
              y: ["0%", "110%"],
              x: [0, Math.random() * 40 - 20],
              opacity: [0.7, 0.9, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        );
      })}
    </>
  );
}

function SunEffect() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          right: "10%",
          top: "15%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fbbf2488 0%, #f59e0b88 100%)",
          filter: "blur(30px)",
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: "none"
        }}
        animate={{
          scale: [1, 1.09, 1.04, 1],
          opacity: [0.91, 0.99, 0.81, 0.91]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
    </>
  );
}

function NightGlow() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          left: "9%",
          top: "-16%",
          width: "82%",
          height: 230,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #29297a66 0%, #25284dbb 100%)",
          filter: "blur(40px)",
          opacity: 0.82,
          zIndex: 1,
          pointerEvents: "none"
        }}
        animate={{ scale: [1, 1.12, 0.93, 1] }}
        transition={{ duration: 17, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: "62%",
          bottom: "-11%",
          width: 180,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7d86c799 0%, #1a203bff 100%)",
          filter: "blur(44px)",
          opacity: 0.47,
          zIndex: 1,
          pointerEvents: "none"
        }}
        animate={{ scale: [1, 1.07, 0.98, 1] }}
        transition={{ duration: 23, repeat: Infinity, repeatType: "mirror" }}
      />
    </>
  );
}

// Остальные функции остаются без изменений
const theme = createTheme({
  typography: { fontFamily: ['Montserrat'].join(',') },
});

async function getCityPhoto(city) {
  const ACCESS_KEY = process.env.REACT_APP_UNSPLASH_KEY;
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(city)}%20landmark&orientation=landscape&client_id=${ACCESS_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.urls?.regular || null;
  } catch {
    return null;
  }
}

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function findNearestForecast(forecastList, targetDate, targetHour) {
  const target = new Date(targetDate);
  target.setHours(targetHour, 0, 0, 0);

  const dayForecasts = forecastList.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate.getDate() === target.getDate() &&
           itemDate.getMonth() === target.getMonth() &&
           itemDate.getFullYear() === target.getFullYear();
  });

  if (dayForecasts.length === 0) {
    return null;
  }

  let minDiff = Infinity;
  let nearest = null;
  
  for (const item of dayForecasts) {
    const itemDate = new Date(item.dt * 1000);
    const diff = Math.abs(itemDate.getTime() - target.getTime());
    
    if (diff < minDiff) {
      minDiff = diff;
      nearest = item;
    }
  }

  return nearest;
}

function getBgGradient(desc, isNight) {
  if (!desc) return "linear-gradient(160deg, #7fcfff 0%, #e7e9fd 100%)";
  if (desc.toLowerCase().includes('ясно')) return isNight 
    ? "linear-gradient(145deg, #1e293b 0%, #334155 50%, #475569 100%)"
    : "linear-gradient(160deg, #7fcfff 0%, #e7e9fd 100%)";
  if (desc.toLowerCase().match(/облач|пасмур|cloud/)) return "linear-gradient(180deg, #bfc9dc 0%, #dbe5fa 100%)";
  if (desc.toLowerCase().includes('дожд')) return "linear-gradient(180deg, #6c7ba1 0%, #b1bfd8 100%)";
  if (desc.toLowerCase().includes('снег')) return "linear-gradient(180deg, #e0f2fc 0%, #f2fafc 100%)";
  return "linear-gradient(160deg, #7fcfff 0%, #e7e9fd 100%)";
}

function App() {
  const [city, setCity] = useState("Москва");
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [forecastData, setForecastData] = useState([]); // 🆕 Для передачи в карусель
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [logoTop, setLogoTop] = useState(32);
  const [desc, setDesc] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('weatherFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [airQualityData, setAirQualityData] = useState(null);
  const [uvData, setUvData] = useState(null);
  const [coords, setCoords] = useState(null);
  // ДОБАВИТЬ эти строки после существующих состояний:
  const [initialDesc, setInitialDesc] = useState(""); // Для фона
  const [initialIsNight, setInitialIsNight] = useState(false); // Для фона
  
  // 🆕 Состояние для выбранного времени в карусели
  const [selectedWeatherData, setSelectedWeatherData] = useState(null);

  // 🆕 Колбек для получения данных из карусели
  const handleWeatherChange = (weatherData) => {
    setSelectedWeatherData(weatherData);
  };

  // Функции обработки остаются без изменений
  const handleShareWeather = (weather) => {
    const shareText = `🌤️ Погода в ${weather.city}: ${weather.temp}°, ${weather.desc.toLowerCase()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'EasyWeather',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Информация о погоде скопирована в буфер обмена!');
      }).catch(() => {
        alert(`${shareText}\n\nСкопируйте эту информацию вручную`);
      });
    }
  };

  const handleSaveToFavorites = (cityName) => {
    const newFavorites = [...favorites];
    const index = newFavorites.indexOf(cityName);
    
    if (index > -1) {
      newFavorites.splice(index, 1);
      alert(`${cityName} удален из избранного`);
    } else {
      newFavorites.push(cityName);
      alert(`${cityName} добавлен в избранное!`);
    }
    
    setFavorites(newFavorites);
    try {
      localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Не удалось сохранить избранное:', e);
    }
  };

  const renderCityLabel = (
    <div style={{
      textAlign: "center",
      marginBottom: 8,
      color: "#fff",
      fontWeight: 500,
      fontSize: 20,
      letterSpacing: 0.3,
      textShadow: "0 2px 8px rgba(0,0,0,0.57), 0 0 1px #fff",
      fontFamily: "Montserrat, Arial, sans-serif"
    }}>
      Город
    </div>
  );

  useEffect(() => {
    function handleResize() {
      setLogoTop(window.innerHeight < 500 ? 8 : 32);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (weather?.city) { // ← Добавили проверку
      getCityPhoto(weather.city).then(setPhotoUrl);
    }
  }, [weather?.city]);

  // 🔧 ОБНОВЛЕННАЯ ЛОГИКА ЗАГРУЗКИ ПОГОДЫ
  const handleShowWeather = async () => {
    setLoading(true);
    try {
      if (isToday(date)) {
        // Получаем текущую погоду
        const data = await fetchWeatherFromBackend(city);
        const details = {
          feels: Math.round(data.main.feels_like),
          pressure: Math.round(data.main.pressure * 0.750062),
          humidity: data.main.humidity,
          wind: `${Math.round(data.wind.speed)} м/с`
        };

        const currentWeather = {
          city: data.name,
          temp: Math.round(data.main.temp),
          desc: data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1),
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
          details
        };

        setWeather(currentWeather);
        setSelectedWeatherData(currentWeather); // 🆕 Инициализируем выбранные данные
        setInitialDesc(data.weather[0].description);
        setInitialIsNight(data.weather[0].icon.includes("n"));

        if (data.coord) {
          setCoords({ lat: data.coord.lat, lon: data.coord.lon });
        }

        // Получаем почасовой прогноз
        const { list: forecastList } = await fetchForecast(city);
        setForecastData(forecastList); // 🆕 Сохраняем для карусели

        // Получаем дополнительные данные
        try {
          const airData = await fetchAirQuality(city);
          setAirQualityData(airData);
        } catch (e) {
          console.error('Air quality error:', e);
          setAirQualityData(null);
        }

        try {
          const uvIndexData = await fetchUVIndex(city);
          setUvData(uvIndexData);
        } catch (e) {
          console.error('UV index error:', e);
          setUvData(null);
        }

      } else {
        // Логика для будущих дат остается без изменений
        const { list: forecastList } = await fetchForecast(city);
        const now = new Date();
        const targetHour = now.getHours();
        const mainForecast = findNearestForecast(forecastList, date, targetHour);
        
        if (mainForecast) {
          const forecastWeather = {
            city: city,
            temp: Math.round(mainForecast.main.temp),
            desc: mainForecast.weather[0].description[0].toUpperCase() + mainForecast.weather[0].description.slice(1),
            icon: `https://openweathermap.org/img/wn/${mainForecast.weather[0].icon}@4x.png`,
            details: {
              feels: Math.round(mainForecast.main.feels_like),
              pressure: Math.round(mainForecast.main.pressure * 0.750062),
              humidity: mainForecast.main.humidity,
              wind: `${Math.round(mainForecast.wind.speed)} м/с`
            }
          };
          
          setWeather(forecastWeather);
          setSelectedWeatherData(forecastWeather);
          setForecastData(forecastList);
        }
        
        setDesc(mainForecast?.weather?.[0]?.description || "");
        setIsNight(mainForecast?.weather?.[0]?.icon?.includes("n") || false);
      }
    } catch (e) {
      console.error('Weather error:', e);
      alert("Ошибка получения данных: " + e.message);
    }
    setLoading(false);
  };

  // Геолокация остается без изменений (аналогично handleShowWeather)
  const handleGeoWeather = () => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается браузером");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const data = await fetchWeather({ lat, lon });
          const details = {
            feels: Math.round(data.main.feels_like),
            pressure: Math.round(data.main.pressure * 0.750062),
            humidity: data.main.humidity,
            wind: `${Math.round(data.wind.speed)} м/с`
          };

          setCity(data.name);

          const currentWeather = {
            city: data.name,
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1),
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
            details
          };

          setWeather(currentWeather);
          setSelectedWeatherData(currentWeather);
          setDesc(data.weather[0].description);
          setIsNight(data.weather[0].icon.includes("n"));
          setCoords({ lat, lon });

          const { list: forecastList } = await fetchForecast({ lat, lon });
          setForecastData(forecastList);

          try {
            const airData = await fetchAirQuality({ lat, lon });
            setAirQualityData(airData);
          } catch (e) {
            console.error('Air quality error:', e);
            setAirQualityData(null);
          }

          try {
            const uvIndexData = await fetchUVIndex({ lat, lon });
            setUvData(uvIndexData);
          } catch (e) {
            console.error('UV index error:', e);
            setUvData(null);
          }

        } catch (error) {
          console.error('Geo weather error:', error);
          setWeather({ 
            city: "?", 
            temp: '--', 
            desc: 'Ошибка при получении геолокации', 
            icon: '', 
            details: {} 
          });
          setForecastData([]);
          setPhotoUrl(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert("Не удалось получить геолокацию: " + error.message);
        setLoading(false);
      }
    );
  };

  // 🆕 Используем выбранные данные для всех блоков
  const activeWeatherData = selectedWeatherData || weather;

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        key={desc + (isNight ? 'night' : 'day')}
        style={{
          minHeight: '100vh',
          paddingTop: "max(36px, env(safe-area-inset-top))",
          paddingBottom: 120,
          position: "relative",
          overflow: "hidden",
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}
        animate={{ background: getBgGradient(initialDesc, initialIsNight) }}
        transition={{ duration: 1.2 }}
      >
        {/* Фоновые эффекты */}
        {photoUrl && (
          <div
            style={{
              position: "absolute",
              zIndex: -2,
              top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.14,
              filter: "blur(2.2px)",
              pointerEvents: "none"
            }}
          />
        )}

        {initialDesc && initialDesc.toLowerCase().match(/облач|пасмур|cloud/) && <CloudsEffect />}
        {initialDesc && initialDesc.toLowerCase().includes('дожд') && <RainEffect />}
        {initialDesc && initialDesc.toLowerCase().includes('снег') && <SnowEffect />}
        {initialDesc && initialDesc.toLowerCase().includes('ясно') && !initialIsNight && <SunEffect />}
        {initialIsNight && <NightGlow />}

        {/* Логотип */}
        <motion.img
          src="/logo.png"
          alt="EasyWeather"
          style={{
            display: "block",
            position: "relative",
            margin: `${logoTop}px auto 16px`,
            width: 130,
            maxWidth: "80vw",
            zIndex: 99,
            height: "auto"
          }}
          animate={{
            scale: [1, 1.08, 0.97, 1],
            rotate: [0, 4, -2, 0],
            y: [0, -7, 0, 3, 0]
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Форма ввода */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.22 }
            }
          }}
          style={{ maxWidth: 340, margin: "0px auto 0", textAlign: 'center', zIndex: 99 }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            {renderCityLabel}
            <CityDateInput
              city={city}
              setCity={setCity}
              date={date}
              setDate={setDate}
              disabled={loading}
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleShowWeather}
              disabled={loading}
              sx={{
                marginTop: 1,
                marginBottom: 0,
                borderRadius: 3,
                height: 46,
                fontSize: 20,
                fontWeight: 500,
                textTransform: "none",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}
            >
              {loading ? <CircularProgress color="inherit" size={24} /> : 'Показать погоду'}
            </Button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              sx={{
                mt: 1,
                color: "#fff",
                borderRadius: 3,
                fontSize: 20,
                fontWeight: 500,
                textTransform: "none",
                height: 46,
                fontFamily: "Montserrat, Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textShadow: "0 2px 8px rgba(0,0,0,0.37), 0 0 1px #fff",
                gap: 1,
              }}
              onClick={handleGeoWeather}
              disabled={loading}
            >
              <span>Погода по геолокации</span>
              <svg
                style={{ marginLeft: 8, minWidth: 22 }}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.7"/>
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.7"/>
                <circle cx="12" cy="12" r="1.7" fill="#2498dc"/>
              </svg>
            </Button>
          </motion.div>
        </motion.div>

        {/* Избранные города */}
        {favorites.length > 0 && !weather && (
          <motion.div
            style={{
              maxWidth: 340,
              margin: "20px auto 0",
              padding: "0 16px"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 8,
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              ⭐ Избранные города
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center"
            }}>
              {favorites.map((favCity, index) => (
                <motion.button
                  key={favCity}
                  onClick={() => {
                    setCity(favCity);
                    setTimeout(handleShowWeather, 100);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 16,
                    padding: "6px 12px",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 500,
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    fontFamily: "Montserrat, Arial, sans-serif"
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  {favCity}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ height: 24 }} />

        {/* 🆕 НОВАЯ КАРУСЕЛЬ И БЛОКИ С ДАННЫМИ */}
        {weather && (
          <div style={{ 
            marginTop: "-15px",
            paddingBottom: "16px"
          }}>
            {/* 🆕 ИНТЕРАКТИВНАЯ КАРУСЕЛЬ ВМЕСТО WeatherCard */}
            <WeatherCarousel 
              city={weather.city}
              temp={weather.temp}
              desc={weather.desc}
              icon={weather.icon}
              details={weather.details}
              forecastData={forecastData}
              photoUrl={photoUrl}
              onWeatherChange={handleWeatherChange}
            />
            
            {/* 🆕 ВСЕ БЛОКИ ПОЛУЧАЮТ ДАННЫЕ ИЗ ВЫБРАННОГО ВРЕМЕНИ */}
            <WeatherAlerts 
              weather={activeWeatherData}
              airQuality={airQualityData}
              uvData={uvData}
              forecast={forecastData}
            />

            <ClothingRecommendations 
              temp={activeWeatherData?.temp || 0}
              desc={activeWeatherData?.desc || ""}
              humidity={activeWeatherData?.details?.humidity}
              windSpeed={parseFloat(activeWeatherData?.details?.wind?.replace(' м/с', '') || '0')}
              isNight={isNight}
            />

            <AirQuality airQualityData={airQualityData} />

            <UVIndex uvData={uvData} isNight={isNight} />

            <Astronomy 
              weatherData={weather} 
              coords={coords}
              date={date}
            />
            
            <WeatherTrends weather={activeWeatherData} />

            <QuickActions 
              weather={activeWeatherData}
              onShareWeather={handleShareWeather}
              onSaveToFavorites={handleSaveToFavorites}
            />
          </div>
        )}

        <AdBanner />
      </motion.div>
    </ThemeProvider>
  );
}

export default App;















