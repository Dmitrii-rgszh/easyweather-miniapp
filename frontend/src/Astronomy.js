// Создайте файл frontend/src/Astronomy.js

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения фазы луны
function getMoonPhase(date) {
  const lunarCycle = 29.53058867; // дней в лунном цикле
  const knownNewMoon = new Date('2000-01-06 18:14:00'); // известное новолуние
  
  const daysSinceKnownNewMoon = (date - knownNewMoon) / (24 * 60 * 60 * 1000);
  const currentPhase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
  
  if (currentPhase < 0.0625 || currentPhase >= 0.9375) {
    return { name: "Новолуние", icon: "🌑", description: "Луна не видна" };
  } else if (currentPhase < 0.1875) {
    return { name: "Растущий серп", icon: "🌒", description: "Молодая луна" };
  } else if (currentPhase < 0.3125) {
    return { name: "Первая четверть", icon: "🌓", description: "Половина луны" };
  } else if (currentPhase < 0.4375) {
    return { name: "Растущая луна", icon: "🌔", description: "Почти полная" };
  } else if (currentPhase < 0.5625) {
    return { name: "Полнолуние", icon: "🌕", description: "Полная луна" };
  } else if (currentPhase < 0.6875) {
    return { name: "Убывающая луна", icon: "🌖", description: "Уменьшается" };
  } else if (currentPhase < 0.8125) {
    return { name: "Последняя четверть", icon: "🌗", description: "Половина луны" };
  } else {
    return { name: "Убывающий серп", icon: "🌘", description: "Старая луна" };
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
  
  sunrise.setHours(Math.floor(12 - t/2), Math.floor((12 - t/2 - Math.floor(12 - t/2)) * 60));
  sunset.setHours(Math.floor(12 + t/2), Math.floor((12 + t/2 - Math.floor(12 + t/2)) * 60));
  
  return { sunrise, sunset, dayLength: t };
}

// Функция расчета золотого часа
function getGoldenHour(sunrise, sunset) {
  const goldenMorningStart = new Date(sunrise.getTime() - 60 * 60 * 1000); // час до восхода
  const goldenMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);   // час после восхода
  const goldenEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);  // час до заката  
  const goldenEveningEnd = new Date(sunset.getTime() + 30 * 60 * 1000);    // 30 мин после заката
  
  return {
    morning: { start: goldenMorningStart, end: goldenMorningEnd },
    evening: { start: goldenEveningStart, end: goldenEveningEnd }
  };
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
  const goldenHour = getGoldenHour(sunrise, sunset);
  
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
        width: "100%",        // 👈 ДОБАВИТЬ
        boxSizing: "border-box", // 👈 ДОБАВИТЬ
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
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{ fontSize: 16 }}>🌙</span>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "Montserrat, Arial, sans-serif"
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
                <span style={{ fontSize: 14 }}>{moonPhase.icon}</span>
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
                  background: "linear-gradient(135deg, #fbbf2420 0%, #f59e0b20 100%)",
                  borderRadius: 12,
                  padding: "12px",
                  marginBottom: 12,
                  border: "2px solid #f59e0b30"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🌅</div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(sunrise)}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Восход
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🌇</div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(sunset)}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Закат
                    </div>
                  </div>
                </div>

                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#6b7280",
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  🌞 Продолжительность дня: <strong>{formatDuration(dayLength)}</strong>
                </div>
              </motion.div>

              {/* Фаза луны */}
              <motion.div
                style={{
                  background: "linear-gradient(135deg, #6366f120 0%, #8b5cf620 100%)",
                  borderRadius: 12,
                  padding: "12px",
                  marginBottom: 12,
                  border: "2px solid #6366f130"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}>
                  <div style={{ fontSize: 32 }}>{moonPhase.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      marginBottom: 2
                    }}>
                      {moonPhase.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {moonPhase.description}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Золотой час */}
              <motion.div
                style={{
                  background: "linear-gradient(135deg, #fbbf2420 0%, #f59e0b20 100%)",
                  borderRadius: 12,
                  padding: "12px",
                  border: "2px solid #f59e0b30"
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 16 }}>📸</span>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif"
                  }}>
                    Золотой час
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8
                }}>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    textAlign: "center"
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Утром
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(goldenHour.morning.start)} - {formatTime(goldenHour.morning.end)}
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    textAlign: "center"
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      Вечером
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#6b7280",
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {formatTime(goldenHour.evening.start)} - {formatTime(goldenHour.evening.end)}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#6b7280",
                  textAlign: "center",
                  fontStyle: "italic",
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  ✨ Идеальное время для фотосъемки
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}