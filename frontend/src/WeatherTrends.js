// Обновленная версия компонента WeatherTrends с увеличенными иконками и цветным фоном

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция генерации реалистичных трендов (имитация данных за предыдущие дни)
function generateTrends(currentWeather) {
  const { temp, humidity, wind, pressure } = currentWeather.details || {};
  const currentTemp = currentWeather.temp;
  const currentWindSpeed = parseFloat(wind?.replace(' м/с', '') || '0');
  
  // Создаем стабильное "случайное" число на основе данных погоды
  const seed = (currentTemp * 100 + (humidity || 50) + currentWindSpeed * 10) % 1000;
  const seedRandom = (seed * 9301 + 49297) % 233280 / 233280;
  
  // Генерируем стабильные изменения (одинаковые для одних и тех же данных)
  const tempYesterday = currentTemp + (seedRandom - 0.5) * 8;
  const humidityYesterday = (humidity || 50) + ((seedRandom * 2) % 1 - 0.5) * 20;
  const windYesterday = currentWindSpeed + ((seedRandom * 3) % 1 - 0.5) * 6;
  const pressureYesterday = (pressure || 760) + ((seedRandom * 4) % 1 - 0.5) * 20;
  
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
      iconBgColor: "#6b728010",
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
      iconBgColor: isGoodChange ? "#10b98115" : "#ef444415",
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
      iconBgColor: isGoodChange ? "#10b98115" : "#f59e0b15",
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
    return null; // Не показываем описание для стабильных параметров
  }
  
  const changeText = direction === "up" ? "выше" : "ниже";
  return `${text}${unit} ${changeText}, чем ${period}`;
}

// Функция определения общей цветовой темы блока
function getTrendsTheme(significantTrends) {
  const positiveChanges = significantTrends.filter(trend => 
    trend.trendInfo.color === "#10b981"
  ).length;
  
  const negativeChanges = significantTrends.filter(trend => 
    trend.trendInfo.color === "#ef4444"
  ).length;
  
  if (positiveChanges > negativeChanges) {
    return {
      mainColor: "#10b981",
      bgColor: "#10b98115",
      iconBgColor: "#10b98110"
    };
  } else if (negativeChanges > positiveChanges) {
    return {
      mainColor: "#ef4444",
      bgColor: "#ef444415",
      iconBgColor: "#ef444410"
    };
  } else {
    return {
      mainColor: "#6366f1",
      bgColor: "#6366f115",
      iconBgColor: "#6366f110"
    };
  }
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

  const trends = useMemo(() => {
    return generateTrends(weather);
  }, [weather?.temp, weather?.details?.humidity, weather?.details?.wind, weather?.details?.pressure]);

  const significantTrends = trends
    .map(trend => ({
      ...trend,
      trendInfo: getTrendInfo(trend.current, trend.previous, trend.parameter)
    }))
    .filter(trend => trend.trendInfo.direction !== "stable")
    .slice(0, 3); // Показываем максимум 3 значимых тренда

  if (significantTrends.length === 0) {
    return null; // Не показываем блок, если нет значимых изменений
  }

  // Для превью берем самый значимый тренд
  const mainTrend = significantTrends[0];
  const theme = getTrendsTheme(significantTrends);

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
              📊
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
              Тренды погоды
            </div>
            {!isExpanded && mainTrend && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2
              }}>
                <span style={{ 
                  fontSize: 16, // Увеличили размер иконки тренда
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                }}>
                  {mainTrend.icon}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600,
                  color: mainTrend.trendInfo.textColor,
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  {mainTrend.parameter}: {mainTrend.trendInfo.text}{mainTrend.unit}
                </span>
                <span style={{ fontSize: 14 }}>{mainTrend.trendInfo.arrow}</span>
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
                        background: `linear-gradient(135deg, ${trendInfo.iconBgColor}, ${trendInfo.bgColor})`,
                        borderRadius: 12,
                        padding: "12px",
                        border: `2px solid ${trendInfo.color}30`,
                        position: "relative",
                        overflow: "hidden"
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 2 }}
                    >
                      {/* Цветная полоска слева */}
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: trendInfo.color,
                        borderRadius: "12px 0 0 12px"
                      }} />

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flex: 1
                        }}>
                          <span style={{ 
                            fontSize: 20, // Увеличили размер иконок параметров
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                          }}>
                            {trend.icon}
                          </span>
                          <div>
                            <div style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#374151",
                              fontFamily: "Montserrat, Arial, sans-serif"
                            }}>
                              {trend.parameter}
                            </div>
                            {description && (
                              <div style={{
                                fontSize: 12,
                                color: "#6b7280",
                                fontFamily: "Montserrat, Arial, sans-serif"
                              }}>
                                {description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}>
                          <span style={{ 
                            fontSize: 18, // Увеличили размер иконки направления
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                          }}>
                            {trendInfo.icon}
                          </span>
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2
                          }}>
                            <span style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: trendInfo.textColor,
                              fontFamily: "Montserrat, Arial, sans-serif"
                            }}>
                              {trendInfo.text}{trend.unit}
                            </span>
                            <span style={{ fontSize: 16 }}>{trendInfo.arrow}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Общий итог */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  marginTop: 12,
                  border: `1px solid ${theme.mainColor}20`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* Тонкая цветная полоска снизу */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: theme.mainColor,
                  borderRadius: "0 0 8px 8px"
                }} />
                
                <div style={{
                  fontSize: 13,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500,
                  textAlign: "center"
                }}>
                  {significantTrends.length === 1 
                    ? `📈 Заметно изменилось: ${significantTrends[0].parameter.toLowerCase()}`
                    : `📊 Изменений: ${significantTrends.length} параметра`
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