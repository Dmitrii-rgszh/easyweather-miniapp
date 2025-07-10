// Обновленная версия компонента Astronomy с увеличенными иконками и цветным фоном

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения фазы луны
function getMoonPhase(date) {
  const lunarCycle = 29.53058867; // дней в лунном цикле
  const knownNewMoon = new Date('2000-01-06 18:14:00'); // известное новолуние
  
  const daysSinceKnownNewMoon = (date - knownNewMoon) / (24 * 60 * 60 * 1000);
  const currentPhase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
  
  if (currentPhase < 0.0625 || currentPhase >= 0.9375) {
    return { name: "Новолуние", icon: "🌑", description: "Луна не видна", color: "#374151" };
  } else if (currentPhase < 0.1875) {
    return { name: "Растущий серп", icon: "🌒", description: "Молодая луна", color: "#6366f1" };
  } else if (currentPhase < 0.3125) {
    return { name: "Первая четверть", icon: "🌓", description: "Половина луны", color: "#8b5cf6" };
  } else if (currentPhase < 0.4375) {
    return { name: "Растущая луна", icon: "🌔", description: "Почти полная", color: "#a855f7" };
  } else if (currentPhase < 0.5625) {
    return { name: "Полнолуние", icon: "🌕", description: "Полная луна", color: "#fbbf24" };
  } else if (currentPhase < 0.6875) {
    return { name: "Убывающая луна", icon: "🌖", description: "Уменьшается", color: "#a855f7" };
  } else if (currentPhase < 0.8125) {
    return { name: "Последняя четверть", icon: "🌗", description: "Половина луны", color: "#8b5cf6" };
  } else {
    return { name: "Убывающий серп", icon: "🌘", description: "Старая луна", color: "#6366f1" };
  }
}

// Функция определения времени дня для цветовой темы
function getTimeTheme(sunrise, sunset, currentTime = new Date()) {
  const currentHour = currentTime.getHours();
  const sunriseHour = sunrise.getHours();
  const sunsetHour = sunset.getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    // Утро/рассвет
    return {
      mainColor: "#f59e0b",
      bgColor: "#f59e0b15",
      iconBgColor: "#f59e0b10"
    };
  } else if (currentHour >= 12 && currentHour < 17) {
    // День
    return {
      mainColor: "#fbbf24",
      bgColor: "#fbbf2415",
      iconBgColor: "#fbbf2410"
    };
  } else if (currentHour >= 17 && currentHour < 21) {
    // Вечер/закат
    return {
      mainColor: "#ef4444",
      bgColor: "#ef444415",
      iconBgColor: "#ef444410"
    };
  } else {
    // Ночь
    return {
      mainColor: "#6366f1",
      bgColor: "#6366f115",
      iconBgColor: "#6366f110"
    };
  }
}

// Функция расчета времени восхода/заката
function calculateSunTimes(lat, lon, date) {
  // Упрощенный расчет (в реальном проекте лучше использовать библиотеку suncalc)
  const day = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const P = Math.asin(0.39795 * Math.cos(0.98563 * (day - 173) * Math.PI / 180));
  
  const argument = -Math.tan(lat * Math.PI / 180) * Math.tan(P);
  const t = 24 - (24 / Math.PI) * Math.acos(argument);
  
  const sunrise = new Date(date);
  const sunset = new Date(date);
  
  sunrise.setHours(Math.floor(12 - t/2), Math.floor(((12 - t/2) % 1) * 60), 0);
  sunset.setHours(Math.floor(12 + t/2), Math.floor(((12 + t/2) % 1) * 60), 0);
  
  const dayLength = (sunset - sunrise) / (1000 * 60 * 60); // в часах
  
  return { sunrise, sunset, dayLength };
}

// SVG стрелка
const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    style={{ color: "#6b7280" }}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

export default function Astronomy({ weatherData, coords, date = new Date() }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weatherData || !coords) {
    return null;
  }

  const { lat, lon } = coords;
  const currentDate = new Date(date);
  
  // Используем данные из OpenWeatherMap API или рассчитываем
  let sunrise, sunset, dayLength;
  
  if (weatherData.sys && weatherData.sys.sunrise && weatherData.sys.sunset) {
    sunrise = new Date(weatherData.sys.sunrise * 1000);
    sunset = new Date(weatherData.sys.sunset * 1000);
    dayLength = (sunset - sunrise) / (1000 * 60 * 60); // в часах
  } else {
    const sunTimes = calculateSunTimes(lat, lon, currentDate);
    sunrise = sunTimes.sunrise;
    sunset = sunTimes.sunset;
    dayLength = sunTimes.dayLength;
  }

  const moonPhase = getMoonPhase(currentDate);
  const theme = getTimeTheme(sunrise, sunset);
  
  const formatTime = (time) => time.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}ч ${m}м`;
  };

  return (
    <motion.div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: "10px",
        margin: "16px auto 0",
        maxWidth: 340,
        width: "100%",
        boxSizing: "border-box",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        cursor: "pointer"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Заголовок с превью */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Левая часть с иконкой и текстом */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1
        }}>
          {/* Контейнер иконки с цветным фоном */}
          <motion.div
            style={{
              width: 48, // Увеличили размер контейнера
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
              border: `1px solid ${theme.mainColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden"
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* Декоративная полоска */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: theme.mainColor,
              borderRadius: "12px 12px 0 0"
            }} />
            
            {/* Крупная иконка */}
            <span style={{ 
              fontSize: 24, // Увеличили размер иконки
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            }}>
              🌙
            </span>
          </motion.div>

          {/* Текстовая информация */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "Montserrat, Arial, sans-serif",
              marginBottom: 2
            }}>
              Астрономия
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2
              }}>
                <span style={{ 
                  fontSize: 16, // Увеличили размер иконки фазы луны
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                }}>
                  {moonPhase.icon}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  color: "#6b7280",
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  ☀️ {formatTime(sunrise)} - {formatTime(sunset)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <ChevronIcon isOpen={isExpanded} />
      </div>

      {/* Развернутый контент */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 16 }}>
              
              {/* Восход и закат */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
                  borderRadius: 12,
                  padding: "12px",
                  marginBottom: 12,
                  border: `2px solid ${theme.mainColor}30`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Цветная полоска сверху */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: theme.mainColor,
                  borderRadius: "12px 12px 0 0"
                }} />

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      fontSize: 24, // Увеличили размер иконок
                      marginBottom: 4,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}>🌅</div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(sunrise)}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Восход
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      fontSize: 24, // Увеличили размер иконок
                      marginBottom: 4,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}>🌇</div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(sunset)}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Закат
                    </div>
                  </div>
                </div>

                <div style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500
                }}>
                  🌞 Продолжительность дня: <strong style={{ color: theme.mainColor }}>{formatDuration(dayLength)}</strong>
                </div>
              </motion.div>

              {/* Фаза луны */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${moonPhase.color}15, ${moonPhase.color}08)`,
                  borderRadius: 12,
                  padding: "12px",
                  marginBottom: 12,
                  border: `2px solid ${moonPhase.color}30`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Цветная полоска слева */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: moonPhase.color,
                  borderRadius: "12px 0 0 12px"
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}>
                  <div style={{ 
                    fontSize: 32, // Увеличили размер иконки луны
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  }}>{moonPhase.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      marginBottom: 2
                    }}>
                      {moonPhase.name}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {moonPhase.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}