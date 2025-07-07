// Обновленный App.js с WeatherCarousel и системой передачи данных всем блокам
import AdminPanel from './AdminPanel';
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
import { canMakeRequest, recordRequest, getUsageStats, activatePremium } from './usageLimit';
import PremiumModal from './PremiumModal';
import UserProfileModal from "./UserProfileModal";
import HealthAlerts from "./HealthAlerts";
import ProfilePage from "./ProfilePage";
import SportAlerts from "./SportAlerts";

// Все эффекты остаются без изменений
function CloudsEffect() {
  const getStableRandom = (index, seed = 1) => {
    return ((index * 9301 + 49297 + seed * 233280) % 233280) / 233280;
  };

  return (
    <>
      {/* СОЛНЦЕ за всем контентом */}
      <motion.div
        style={{
          position: "absolute",
          right: "10%",
          top: "10%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 223, 0, 0.8) 0%, rgba(255, 193, 7, 0.6) 50%, rgba(255, 235, 59, 0.3) 100%)",
          filter: "blur(15px)",
          opacity: 0.9,
          zIndex: 0, // ← ИСПРАВЛЕНО: позади всего контента
          pointerEvents: "none",
          boxShadow: "0 0 40px rgba(255, 223, 0, 0.4)"
        }}
        animate={{
          scale: [1, 1.15, 0.9, 1],
          opacity: [0.7, 1, 0.6, 0.7]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
      />

      {/* Солнечные лучи за контентом */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          style={{
            position: "absolute",
            right: "23%",
            top: "25%",
            width: 2,
            height: 40 + getStableRandom(i, 10) * 30,
            background: "linear-gradient(180deg, rgba(255, 223, 0, 0.7) 0%, rgba(255, 235, 59, 0.4) 50%, transparent 100%)",
            transformOrigin: "bottom center",
            transform: `rotate(${i * 30}deg)`,
            filter: "blur(1px)",
            opacity: 0.8,
            zIndex: -1, // ← ИСПРАВЛЕНО
            pointerEvents: "none"
          }}
          animate={{
            scaleY: [0.6, 1.2, 0.8, 0.6],
            opacity: [0.5, 0.9, 0.4, 0.5]
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            repeatType: "mirror"
          }}
        />
      ))}

      {/* ОБЛАКА за контентом */}
      {[...Array(4)].map((_, i) => {
        const leftOffset = getStableRandom(i, 1) * 25;
        const topOffset = getStableRandom(i, 2) * 35;
        const widthOffset = getStableRandom(i, 3) * 60;
        const heightOffset = getStableRandom(i, 4) * 30;
        
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${i * 25 + leftOffset}%`,
              top: `${35 + i * 18 + topOffset}px`,
              width: 160 + i * 50 + widthOffset,
              height: 60 + i * 25 + heightOffset,
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              filter: "blur(10px)",
              opacity: 0.9,
              zIndex: 0, // ← ИСПРАВЛЕНО: между фоном города (-2) и контентом
              pointerEvents: "none",
              boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)"
            }}
            animate={{
              x: [0, 40 + i * 25, 0],
              scale: [1, 1.25, 0.85, 1],
              opacity: [0.7, 1, 0.6, 0.7]
            }}
            transition={{
              duration: 20 + i * 6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Мелкие облачка */}
      {[...Array(3)].map((_, i) => {
        const leftPos = 15 + getStableRandom(i, 6) * 65;
        const topPos = 10 + getStableRandom(i, 7) * 50;
        
        return (
          <motion.div
            key={`contrast-${i}`}
            style={{
              position: "absolute",
              left: `${leftPos}%`,
              top: `${topPos}%`,
              width: 80 + getStableRandom(i, 8) * 50,
              height: 35 + getStableRandom(i, 9) * 20,
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "50%",
              filter: "blur(6px)",
              opacity: 0.8,
              zIndex: -1, // ← ИСПРАВЛЕНО
              pointerEvents: "none",
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.4)"
            }}
            animate={{
              x: [0, 25, 0],
              opacity: [0.6, 0.9, 0.5, 0.6],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: i * 1.5
            }}
          />
        );
      })}
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
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
  const [initialDesc, setInitialDesc] = useState(""); // Для фона
  const [initialIsNight, setInitialIsNight] = useState(false); // Для фона
  const [selectedWeatherData, setSelectedWeatherData] = useState(null);
  const handleWeatherChange = (weatherData) => {
    setSelectedWeatherData(weatherData);
  };
  const [usageStats, setUsageStats] = useState(getUsageStats());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumUser, setPremiumUser] = useState(getUsageStats().isPremium);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);

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
      marginBottom: 10,
      color: "#1976d2", // Material-UI primary blue
      fontWeight: 600,
      fontSize: 18,
      letterSpacing: 0.5,
      zIndex: 50,
      fontFamily: "Montserrat, Arial, sans-serif",
    }}>
      Город
    </div>
  );
  
  // ИСПРАВЛЕННЫЙ DEV хоткей для App.js

useEffect(() => {
    // Исправленный хоткей для полного сброса в dev режиме
    const handleDevReset = (e) => {
      // Ctrl + Shift + R = Full Reset (опрос + премиум + избранное)
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
      
        if (window.confirm('🔄 DEV RESET: Сбросить ВСЕ данные? (опрос + премиум + избранное)')) {
          try {
            console.log('🛠️ DEV: Начинаю полный сброс...');
          
            // 1. Сброс профиля пользователя
            localStorage.removeItem('userProfile');
            setUserProfile(null);
            console.log('✅ Профиль пользователя сброшен');
          
            // 2. ПРАВИЛЬНЫЙ сброс премиума - используем ключи из usageLimit.js
            localStorage.removeItem('weatherUsage'); // Основной ключ лимитов
            localStorage.removeItem('weatherPremiumUser'); // Старый ключ (на всякий случай)
            localStorage.removeItem('weatherRequestCount'); // Старый ключ
            localStorage.removeItem('weatherLastRequestDate'); // Старый ключ
          
            setPremiumUser(false);
            setUsageStats(getUsageStats()); // Обновляем статистику
            console.log('✅ Премиум статус сброшен (weatherUsage удален)');
          
            // 3. Сброс избранного
            localStorage.removeItem('weatherFavorites');
            setFavorites([]);
            console.log('✅ Избранные города сброшены');
          
            // 4. Сброс погодных данных
            setWeather(null);
            setSelectedWeatherData(null);
            setForecastData([]);
            setAirQualityData(null);
            setUvData(null);
            console.log('✅ Погодные данные очищены');
          
            // 5. Показываем опрос
            setShowProfileModal(true);
          
            console.log('🎉 DEV: Полный сброс завершен!');
            alert('🎉 DEV: Полный сброс завершен!\n\n✅ Опрос сброшен\n✅ Премиум отключен (5/5 запросов)\n✅ Избранное очищено\n✅ Данные сброшены');
          
          } catch (error) {
            console.error('❌ DEV: Ошибка при сбросе:', error);
            alert('❌ Ошибка при сбросе данных');
          }
        }
      }
    
      // Ctrl + Shift + P = Reset только Premium
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
      
        if (window.confirm('💎 DEV: Сбросить только премиум статус?')) {
          try {
            // ПРАВИЛЬНЫЙ сброс - удаляем ключ weatherUsage
            localStorage.removeItem('weatherUsage');
            localStorage.removeItem('weatherPremiumUser');
            localStorage.removeItem('weatherRequestCount');
            localStorage.removeItem('weatherLastRequestDate');
          
            setPremiumUser(false);
            setUsageStats(getUsageStats());
          
            console.log('💎 DEV: Премиум статус сброшен (weatherUsage очищен)');
            alert('💎 Премиум статус сброшен! Теперь 5/5 запросов.');
          } catch (error) {
            console.error('❌ DEV: Ошибка сброса премиума:', error);
          }
        }
      }
    
      // Ctrl + Shift + U = Reset только опрос пользователя
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
      
        if (window.confirm('👤 DEV: Сбросить только опрос пользователя?')) {
          try {
            localStorage.removeItem('userProfile');
            setUserProfile(null);
            setShowProfileModal(true);
          
            console.log('👤 DEV: Опрос пользователя сброшен');
            alert('👤 Опрос пользователя сброшен!');
          } catch (error) {
            console.error('❌ DEV: Ошибка сброса опроса:', error);
          }
        }
      }
    
      // Ctrl + Shift + L = Показать все ключи localStorage (debug)
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
      
        console.log('🔍 DEV: Все ключи localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          console.log(`${key}:`, value);
        }
      
        const usage = getUsageStats();
        console.log('📊 Текущие лимиты:', usage);
      }
    };

    // Добавляем хоткеи только в dev режиме
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleDevReset);
    
      // Консольные команды для удобства
      window.devReset = {
        all: () => {
          localStorage.clear();
          window.location.reload();
          console.log('🔥 DEV: ПОЛНАЯ ОЧИСТКА + перезагрузка');
        },
      
        user: () => {
          localStorage.removeItem('userProfile');
          setUserProfile(null);
          setShowProfileModal(true);
          console.log('👤 DEV: Опрос сброшен');
        },
      
        premium: () => {
          localStorage.removeItem('weatherUsage'); // ГЛАВНЫЙ ключ!
          localStorage.removeItem('weatherPremiumUser');
          localStorage.removeItem('weatherRequestCount');
          localStorage.removeItem('weatherLastRequestDate');
          setPremiumUser(false);
          setUsageStats(getUsageStats());
          console.log('💎 DEV: Премиум сброшен (лимит 5/5)');
        },
      
        favorites: () => {
          localStorage.removeItem('weatherFavorites');
          setFavorites([]);
          console.log('⭐ DEV: Избранное сброшено');
        },
      
        // Новая команда для отладки
        debug: () => {
          console.log('🔍 DEV DEBUG:');
          console.log('localStorage keys:', Object.keys(localStorage));
          console.log('usageStats:', getUsageStats());
          console.log('weatherUsage:', localStorage.getItem('weatherUsage'));
          console.log('premiumUser state:', premiumUser);
        }
      };
    
      // Красивая инструкция в консоли
      console.log(`
  🛠️ DEV MODE АКТИВИРОВАН! 
    
  📋 ХОТКЕИ:
  • Ctrl+Shift+R = 🔄 ПОЛНЫЙ СБРОС (опрос + премиум + избранное)
  • Ctrl+Shift+P = 💎 Сброс только премиума  
  • Ctrl+Shift+U = 👤 Сброс только опроса
  • Ctrl+Shift+L = 🔍 Показать все ключи localStorage

  💻 КОНСОЛЬНЫЕ КОМАНДЫ:
  • devReset.all()       - Полная очистка + перезагрузка
  • devReset.user()      - Сброс опроса
  • devReset.premium()   - Сброс премиума (правильно!)
  • devReset.favorites() - Сброс избранного
  • devReset.debug()     - Отладочная информация

  🐛 ИСПРАВЛЕНО: Теперь правильно сбрасывается ключ 'weatherUsage'
      `);
    
      return () => window.removeEventListener('keydown', handleDevReset);
    }
  }, [setUserProfile, setShowProfileModal, setPremiumUser, setUsageStats, setFavorites, setWeather, setSelectedWeatherData, setForecastData, setAirQualityData, setUvData, premiumUser]);

  // Дополнительно - показываем DEV статус в заголовке (опционально)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      document.title = '🛠️ DEV | EasyWeather';
    }
  }, []);

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

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setShowProfileModal(true); // Показать опрос
    }
  }, []);

  // 🔧 ОБНОВЛЕННАЯ ЛОГИКА ЗАГРУЗКИ ПОГОДЫ
  const handleShowWeather = async () => {
    // Проверяем лимиты ПЕРЕД запросом
    const requestCheck = canMakeRequest();
  
    if (!requestCheck.canMake) {
      // Показываем Premium modal если лимит исчерпан
      setShowPremiumModal(true);
      return;
    }

    setLoading(true);
    recordRequest();
    setUsageStats(getUsageStats());

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
    // Проверяем лимиты ПЕРЕД запросом
    const requestCheck = canMakeRequest();

    if (!requestCheck.canMake) {
      // Показываем Premium modal если лимит исчерпан
      setShowPremiumModal(true);
      return;
    }

    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается браузером");
      return;
    }
  
  setLoading(true);
  recordRequest();
  setUsageStats(getUsageStats());
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
  // Компонент показа статистики использования
  const renderUsageIndicator = () => {
    if (premiumUser) {
      return (
        <motion.div
          style={{
            position: 'absolute',
            top: logoTop + 50, // На том же уровне что и логотип
            right: '20px',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            color: '#1a1a1a',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'Montserrat, Arial, sans-serif',
            zIndex: 100,
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          💎 Premium
        </motion.div>
      );
    }

    const percentage = usageStats.percentage;
    const isLow = usageStats.remaining <= 1;
  
    return (
      <motion.div
        style={{
          position: 'absolute',
          top: logoTop + 50, // На том же уровне что и логотип
          right: '20px',
          background: isLow 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'Montserrat, Arial, sans-serif',
          zIndex: 100,
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
          cursor: isLow ? 'pointer' : 'default'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={isLow ? () => setShowPremiumModal(true) : undefined}
        whileHover={isLow ? { scale: 1.05 } : {}}
      >
        {isLow && '🔥 '}
        {usageStats.remaining}/{usageStats.limit} запросов
      </motion.div>
    );
  };

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
        
        {/* Избранные города - ОБНОВЛЕННАЯ ВЕРСИЯ */}
{favorites.length > 0 && (
  <motion.div
    style={{
      margin: "20px auto 0",
      maxWidth: 340,
      width: "100%"
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.5 }}
  >
    {/* Заголовок избранного */}
    <div style={{
      textAlign: "center",
      marginBottom: 12,
      color: "#fff",
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: 0.3,
      textShadow: "0 2px 8px rgba(0,0,0,0.57), 0 0 1px #fff",
      fontFamily: "Montserrat, Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      Избранные города
      </div>

      {/* Список городов */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>
        {favorites.map((favCity, index) => (
          <motion.div
            key={favCity}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: 15,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            {/* Левая часть - иконка и название города */}
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                cursor: "pointer"
              }}
              onClick={() => {
                setCity(favCity);
                handleShowWeather();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)"
              }}>
                ⭐
              </div>
              <div style={{
                fontFamily: "Montserrat, Arial, sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#374151"
              }}>
                {favCity}
              </div>
            </motion.div>

            {/* Правая часть - кнопки действий */}
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              {/* Кнопка быстрого просмотра */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setCity(favCity);
                  handleShowWeather();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Показать погоду"
              >
                👁️
              </motion.button>

              {/* Кнопка удаления */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  const newFavorites = favorites.filter(city => city !== favCity);
                  setFavorites(newFavorites);
                  try {
                    localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
                  } catch (e) {
                    console.error('Не удалось сохранить избранное:', e);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  color: "white",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                title="Удалить из избранного"
              >
                🗑️
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Подсказка */}
      <motion.div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 12,
          color: "rgba(255,255,255,0.8)",
          fontFamily: "Montserrat, Arial, sans-serif"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        👁️ Быстрый просмотр • 🗑️ Удалить
      </motion.div>
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

            {/* Медицинские алерты */}
            {activeWeatherData && (
              <HealthAlerts 
                weather={activeWeatherData}
                userProfile={userProfile}
                forecastData={forecastData}
              />
            )}
            
            {/* Спортивные алерты */}
            {activeWeatherData && userProfile && (
              <SportAlerts 
                weather={activeWeatherData}
                userProfile={userProfile}
                forecastData={forecastData}
                uvData={uvData}
              />
            )}

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
              forecastData={forecastData}
              userProfile={userProfile} // ← ДОБАВИТЬ ЭТУ СТРОКУ
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
              onOpenAdminPanel={() => setShowAdminPanel(true)}
              onOpenProfile={() => setShowProfilePage(true)} // Новый пропс
              userProfile={userProfile} // Передаем профиль
            />
          </div>
        )}

        {/* Индикатор использования */}
        {renderUsageIndicator()}

        {/* Premium Modal */}
        <PremiumModal 
          isVisible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            activatePremium();
            setPremiumUser(true);
            setUsageStats(getUsageStats());
            setShowPremiumModal(false);
            alert('🎉 Premium активирован! Добро пожаловать в мир безлимитной погоды!');
          }}
          usageStats={usageStats}
        />

        {/* Premium Modal */}
        <PremiumModal 
          isVisible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            activatePremium();
            setPremiumUser(true);
            setUsageStats(getUsageStats());
            setShowPremiumModal(false);
            alert('🎉 Premium активирован! Добро пожаловать в мир безлимитной погоды!');
          }}
          usageStats={usageStats}
        />

        {/* 🆕 ДОБАВЬТЕ ЭТОТ БЛОК: */}
        <UserProfileModal 
          isVisible={showProfileModal}
          onComplete={(profile) => {
            setUserProfile(profile);
            setShowProfileModal(false);
            console.log('Профиль сохранен:', profile);
          }}
          onClose={() => {
            setShowProfileModal(false);
            console.log('Опрос пропущен - пользователь может пройти его позже');
          }}
        />

        <AdBanner isPremium={premiumUser} />
        {/* Панель администратора */}
        <AdminPanel 
          isVisible={showAdminPanel} 
          onClose={() => setShowAdminPanel(false)} 
        />
        {/* Profile Page */}
        {showProfilePage && (
          <ProfilePage 
            userProfile={userProfile}
            onStartSurvey={() => {
              setShowProfilePage(false);
              setShowProfileModal(true);
            }}
            onClose={() => setShowProfilePage(false)}
          />
        )}
        
      </motion.div>
    </ThemeProvider>
  );
}

export default App;















