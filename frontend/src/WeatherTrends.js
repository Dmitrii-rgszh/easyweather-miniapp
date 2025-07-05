// Создайте файл frontend/src/WeatherTrends.js

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция генерации реалистичных трендов (имитация данных за предыдущие дни)
function generateTrends(currentWeather) {
  const { temp, humidity, wind, pressure } = currentWeather.details || {};
  const currentTemp = currentWeather.temp;
  const currentWindSpeed = parseFloat(wind?.replace(' м/с', '') || '0');
  
  // Генерируем реалистичные изменения (в реальном проекте данные брались бы из API)
  const tempYesterday = currentTemp + (Math.random() - 0.5) * 8; // ±4°
  const humidityYesterday = (humidity || 50) + (Math.random() - 0.5) * 20; // ±10%
  const windYesterday = currentWindSpeed + (Math.random() - 0.5) * 6; // ±3 м/с
  const pressureYesterday = (pressure || 760) + (Math.random() - 0.5) * 20; // ±10 мм
  
  return [
    {
      parameter: "Температура",
      current: currentTemp,
      previous: Math.round(tempYesterday),
      unit: "°",
      icon: "🌡️",
      period: "вчера"
    },
    {
      parameter: "Влажность", 
      current: humidity || 50,
      previous: Math.round(humidityYesterday),
      unit: "%",
      icon: "💧",
      period: "вчера"
    },
    {
      parameter: "Ветер",
      current: currentWindSpeed,
      previous: Math.round(windYesterday * 10) / 10,
      unit: " м/с",
      icon: "🌬️",
      period: "вчера"
    },
    {
      parameter: "Давление",
      current: pressure || 760,
      previous: Math.round(pressureYesterday),
      unit: " мм",
      icon: "📊",
      period: "вчера"
    }
  ];
}

// Функция определения тренда
function getTrendInfo(current, previous, parameter) {
  const diff = current - previous;
  const absDiff = Math.abs(diff);
  
  // Определяем значимость изменения
  let threshold;
  switch (parameter) {
    case "Температура": threshold = 2; break;
    case "Влажность": threshold = 10; break;
    case "Ветер": threshold = 2; break;
    case "Давление": threshold = 5; break;
    default: threshold = 1;
  }
  
  if (absDiff < threshold * 0.5) {
    return {
      direction: "stable",
      color: "#6b7280",
      bgColor: "#6b728015",
      icon: "➖",
      arrow: "",
      text: "без изменений",
      textColor: "#6b7280"
    };
  }
  
  const isPositive = diff > 0;
  
  // Определяем, хорошо это или плохо
  let isGoodChange;
  switch (parameter) {
    case "Температура":
      isGoodChange = diff > 0 && diff < 10; // теплее, но не слишком жарко
      break;
    case "Влажность":
      isGoodChange = diff < 0 && current < 70; // меньше влажности - хорошо
      break;
    case "Ветер":
      isGoodChange = diff < 0; // меньше ветра - лучше
      break;
    case "Давление":
      isGoodChange = diff > 0; // выше давление - лучше
      break;
    default:
      isGoodChange = true;
  }
  
  if (isPositive) {
    return {
      direction: "up",
      color: isGoodChange ? "#10b981" : "#ef4444",
      bgColor: isGoodChange ? "#10b98120" : "#ef444420",
      icon: isGoodChange ? "📈" : "⚠️",
      arrow: "↗️",
      text: `+${absDiff.toFixed(parameter === "Ветер" ? 1 : 0)}`,
      textColor: isGoodChange ? "#10b981" : "#ef4444"
    };
  } else {
    return {
      direction: "down", 
      color: isGoodChange ? "#10b981" : "#f59e0b",
      bgColor: isGoodChange ? "#10b98120" : "#f59e0b20",
      icon: isGoodChange ? "📉" : "⚠️",
      arrow: "↘️",
      text: `-${absDiff.toFixed(parameter === "Ветер" ? 1 : 0)}`,
      textColor: isGoodChange ? "#10b981" : "#f59e0b"
    };
  }
}

// Функция получения описания тренда
function getTrendDescription(trend, trendInfo) {
  const { parameter, current, previous, unit, period } = trend;
  const { text, direction } = trendInfo;
  
  if (direction === "stable") {
    return `${parameter} осталась без изменений`;
  }
  
  const changeText = direction === "up" ? "выше" : "ниже";
  return `${text}${unit} ${changeText}, чем ${period}`;
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

export default function WeatherTrends({ weather }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather || !weather.details) {
    return null;
  }

  const trends = generateTrends(weather);
  const significantTrends = trends
    .map(trend => ({
      ...trend,
      trendInfo: getTrendInfo(trend.current, trend.previous, trend.parameter)
    }))
    .filter(trend => trend.trendInfo.direction !== "stable")
    .slice(0, 2); // Показываем максимум 2 значимых тренда

  if (significantTrends.length === 0) {
    return null; // Не показываем блок, если нет значимых изменений
  }

  // Для превью берем самый значимый тренд
  const mainTrend = significantTrends[0];

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
      transition={{ duration: 0.6, delay: 0.7 }}
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
          <span style={{ fontSize: 16 }}>📊</span>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              Тренды погоды
            </div>
            {!isExpanded && mainTrend && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2
              }}>
                <span style={{ fontSize: 14 }}>{mainTrend.icon}</span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600,
                  color: mainTrend.trendInfo.textColor,
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  {mainTrend.parameter}: {mainTrend.trendInfo.text}{mainTrend.unit}
                </span>
                <span style={{ fontSize: 12 }}>{mainTrend.trendInfo.arrow}</span>
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
              
              {/* Список всех трендов */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 10
              }}>
                {trends.map((trend, index) => {
                  const trendInfo = getTrendInfo(trend.current, trend.previous, trend.parameter);
                  const description = getTrendDescription(trend, trendInfo);
                  
                  return (
                    <motion.div
                      key={trend.parameter}
                      style={{
                        background: trendInfo.bgColor,
                        borderRadius: 12,
                        padding: "10px 12px",
                        border: `2px solid ${trendInfo.color}30`
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}>
                          <span style={{ fontSize: 16 }}>{trend.icon}</span>
                          <div>
                            <div style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#374151",
                              fontFamily: "Montserrat, Arial, sans-serif"
                            }}>
                              {trend.parameter}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: "#6b7280",
                              fontFamily: "Montserrat, Arial, sans-serif"
                            }}>
                              Сейчас: {trend.current}{trend.unit}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <span style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: trendInfo.textColor,
                            fontFamily: "Montserrat, Arial, sans-serif"
                          }}>
                            {trendInfo.text}{trend.unit}
                          </span>
                          <span style={{ fontSize: 14 }}>{trendInfo.arrow}</span>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: 11,
                        color: "#374151",
                        fontFamily: "Montserrat, Arial, sans-serif",
                        fontStyle: "italic"
                      }}>
                        {description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Общий вывод */}
              <motion.div
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 12,
                  borderLeft: "3px solid #3b82f6"
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div style={{
                  fontSize: 12,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  lineHeight: 1.4
                }}>
                  💡 {significantTrends.length > 1 
                    ? "Погода заметно изменилась по сравнению с вчерашним днем"
                    : "Небольшие изменения в погодных условиях"
                  }
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}