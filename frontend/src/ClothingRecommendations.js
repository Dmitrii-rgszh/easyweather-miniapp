// Обновленный ClothingRecommendations.js с интегрированными детскими рекомендациями
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Умные предупреждения о погоде на 2 часа вперед
const analyzeUpcomingWeather = (forecastData) => {
  if (!forecastData || forecastData.length === 0) return [];
  
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const upcomingForecasts = forecastData.filter(item => {
    const itemTime = new Date(item.dt * 1000);
    return itemTime >= now && itemTime <= twoHoursLater;
  });
  
  const alerts = [];
  
  upcomingForecasts.forEach(item => {
    const desc = item.weather[0].description.toLowerCase();
    const time = new Date(item.dt * 1000);
    const timeStr = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    if (desc.includes('дождь') || desc.includes('ливень')) {
      alerts.push({
        type: 'rain',
        icon: '☔',
        title: 'Дождь приближается!',
        message: `В ${timeStr} ожидается дождь`,
        recommendation: '🌂 Возьмите зонт на всякий случай',
        color: '#ef4444'
      });
    }
  });
  
  return alerts.slice(0, 1);
};

// Функция определения рекомендаций одежды для взрослых
function getClothingRecommendations(temp, desc, humidity, windSpeed, isNight) {
  const recommendations = [];
  
  if (temp < -10) {
    recommendations.push({
      icon: "🧥", text: "Теплая зимняя куртка", color: "#1e40af", priority: 1
    });
    recommendations.push({
      icon: "🧤", text: "Перчатки и шапка", color: "#7c3aed", priority: 1
    });
    recommendations.push({
      icon: "👢", text: "Теплая обувь", color: "#059669", priority: 1
    });
  } else if (temp < 0) {
    recommendations.push({
      icon: "🧥", text: "Зимняя куртка", color: "#1e40af", priority: 1
    });
    recommendations.push({
      icon: "🧣", text: "Шарф и шапка", color: "#7c3aed", priority: 2
    });
  } else if (temp < 10) {
    recommendations.push({
      icon: "🧥", text: "Теплая куртка", color: "#2563eb", priority: 1
    });
    recommendations.push({
      icon: "👖", text: "Длинные брюки", color: "#059669", priority: 2
    });
  } else if (temp < 20) {
    recommendations.push({
      icon: "🧥", text: "Легкая куртка", color: "#0891b2", priority: 2
    });
    recommendations.push({
      icon: "👕", text: "Свитер или кофта", color: "#7c3aed", priority: 2
    });
  } else if (temp < 25) {
    recommendations.push({
      icon: "👕", text: "Легкая одежда", color: "#059669", priority: 2
    });
    recommendations.push({
      icon: "👟", text: "Удобная обувь", color: "#0891b2", priority: 3
    });
  } else {
    recommendations.push({
      icon: "👕", text: "Легкая футболка", color: "#059669", priority: 2
    });
    recommendations.push({
      icon: "🩳", text: "Шорты", color: "#0891b2", priority: 2
    });
    recommendations.push({
      icon: "🕶️", text: "Солнцезащитные очки", color: "#f59e0b", priority: 3
    });
  }

  // Дополнительные рекомендации по погодным условиям
  if (desc.toLowerCase().includes('дожд') || desc.toLowerCase().includes('rain')) {
    recommendations.push({
      icon: "🌂", text: "Зонт обязательно!", color: "#dc2626", priority: 1
    });
    recommendations.push({
      icon: "🥾", text: "Водонепроницаемая обувь", color: "#7c3aed", priority: 2
    });
  }

  if (desc.toLowerCase().includes('снег') || desc.toLowerCase().includes('snow')) {
    recommendations.push({
      icon: "❄️", text: "Защита от снега", color: "#0891b2", priority: 1
    });
  }

  if (windSpeed > 10) {
    recommendations.push({
      icon: "🌬️", text: "Ветрозащитная одежда", color: "#6366f1", priority: 2
    });
  }

  if (humidity > 80) {
    recommendations.push({
      icon: "💧", text: "Дышащие материалы", color: "#0891b2", priority: 3
    });
  }

  if (isNight) {
    recommendations.push({
      icon: "🌙", text: "Светоотражающие элементы", color: "#7c3aed", priority: 3
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

// Функция детских рекомендаций одежды (упрощенная версия)
function getChildrenClothingRecommendations(temp, desc, humidity, windSpeed) {
  const recommendations = [];
  const childTemp = temp - 3; // Температурная коррекция для детей
  
  // Базовая одежда по температуре
  if (childTemp < -15) {
    recommendations.push({
      icon: "🧥", text: "Теплый пуховик + утепленные штаны", color: "#1e40af", priority: 1
    });
    recommendations.push({
      icon: "🧤", text: "Варежки + шапка + шарф обязательно", color: "#1e40af", priority: 1
    });
  } else if (childTemp < -5) {
    recommendations.push({
      icon: "🧥", text: "Зимняя куртка + теплые штаны", color: "#2563eb", priority: 1
    });
    recommendations.push({
      icon: "🧤", text: "Шапка + варежки + шарф", color: "#2563eb", priority: 1
    });
  } else if (childTemp < 5) {
    recommendations.push({
      icon: "🧥", text: "Демисезонная куртка + кофта", color: "#0891b2", priority: 1
    });
    recommendations.push({
      icon: "🧢", text: "Шапка + легкие перчатки", color: "#0891b2", priority: 2
    });
  } else if (childTemp < 15) {
    recommendations.push({
      icon: "👕", text: "Кофта + ветровка", color: "#059669", priority: 1
    });
  } else if (childTemp < 25) {
    recommendations.push({
      icon: "👕", text: "Футболка + легкая кофта", color: "#7c3aed", priority: 1
    });
  } else {
    recommendations.push({
      icon: "👕", text: "Легкая футболка + шорты", color: "#f59e0b", priority: 1
    });
    recommendations.push({
      icon: "🧢", text: "Панама от солнца обязательно", color: "#f59e0b", priority: 1
    });
  }

  // Усиленная защита от ветра для детей
  if (windSpeed > 8) {
    recommendations.push({
      icon: "🌬️", text: "Ветрозащитная куртка обязательна", color: "#6366f1", priority: 1
    });
  }

  // Солнцезащита для детей
  if (temp > 20 && !desc.toLowerCase().includes('облач')) {
    recommendations.push({
      icon: "🕶️", text: "Солнцезащитные очки + крем SPF 30+", color: "#f59e0b", priority: 1
    });
  }

  // Дождевая защита
  if (desc.toLowerCase().includes('дождь')) {
    recommendations.push({
      icon: "☔", text: "Непромокаемый плащ + резиновые сапоги", color: "#0891b2", priority: 1
    });
    recommendations.push({
      icon: "🎒", text: "Запасная одежда в рюкзаке", color: "#0891b2", priority: 2
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

// Функция получения совета для родителей
function getParentTip(temp, windSpeed, desc) {
  if (temp < 0) {
    return "Проверяйте, не вспотел ли ребенок. Лучше несколько тонких слоев, чем один толстый.";
  } else if (windSpeed > 10) {
    return "При сильном ветре закрывайте коляску и следите, чтобы ребенок не переохладился.";
  } else if (desc.toLowerCase().includes('дождь')) {
    return "Возьмите запасную одежду и позаботьтесь о сухой обуви после прогулки.";
  } else if (temp > 25) {
    return "В жару чаще предлагайте воду и ищите тенистые места для игр.";
  } else {
    return "Одевайте ребенка так, чтобы легко можно было снять или добавить слой одежды.";
  }
}

// Функция определения основной цветовой темы блока
function getClothingTheme(temp, desc) {
  if (temp < -10) {
    return { mainColor: "#1e40af", bgColor: "#1e40af15", iconBgColor: "#1e40af10" };
  } else if (temp < 0) {
    return { mainColor: "#2563eb", bgColor: "#2563eb15", iconBgColor: "#2563eb10" };
  } else if (temp < 10) {
    return { mainColor: "#0891b2", bgColor: "#0891b215", iconBgColor: "#0891b210" };
  } else if (temp < 20) {
    return { mainColor: "#059669", bgColor: "#05966915", iconBgColor: "#05966910" };
  } else if (temp < 25) {
    return { mainColor: "#7c3aed", bgColor: "#7c3aed15", iconBgColor: "#7c3aed10" };
  } else {
    return { mainColor: "#f59e0b", bgColor: "#f59e0b15", iconBgColor: "#f59e0b10" };
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

export default function ClothingRecommendations({ temp, desc, humidity, windSpeed, isNight, forecastData, userProfile }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const adultRecommendations = getClothingRecommendations(temp, desc, humidity || 50, windSpeed || 0, isNight);
  const theme = getClothingTheme(temp, desc);
  const upcomingAlerts = analyzeUpcomingWeather(forecastData?.list || []);
  
  // Детские рекомендации только если в профиле выбрано "children"
  const showChildrenRecommendations = userProfile?.activity?.includes('children');
  const childrenRecommendations = showChildrenRecommendations 
    ? getChildrenClothingRecommendations(temp, desc, humidity || 50, windSpeed || 0)
    : [];

  if (adultRecommendations.length === 0) return null;

  const previewIcons = adultRecommendations.slice(0, 2).map(item => item.icon);

  return (
    <>
      {/* Блок предупреждений */}
      {upcomingAlerts.length > 0 && (
        <motion.div
          style={{
            background: "rgba(255, 69, 69, 0.1)",
            border: "2px solid #ef4444", 
            borderRadius: 16,
            padding: 12,
            margin: "16px auto 0",
            maxWidth: 340,
            width: "100%",
            position: "relative",
            boxSizing: "border-box",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(239,68,68,0.2)"
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 20
          }}>
            ⚠️
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24 }}>☔</div>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#ef4444",
                marginBottom: 4,
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {upcomingAlerts[0].title}
              </div>
              <div style={{
                fontSize: 12,
                color: "#374151",
                marginBottom: 4,
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {upcomingAlerts[0].message}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#1f2937",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {upcomingAlerts[0].recommendation}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Основной блок рекомендаций */}
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
        transition={{ duration: 0.6, delay: 0.3 }}
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
            gap: 12,
            flex: 1
          }}>
            <motion.div
              style={{
                width: 48,
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
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: theme.mainColor,
                borderRadius: "12px 12px 0 0"
              }} />
              
              <span style={{ 
                fontSize: 24,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
              }}>
                👕
              </span>
            </motion.div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#374151",
                fontFamily: "Montserrat, Arial, sans-serif",
                marginBottom: 2
              }}>
                Рекомендации одежды
              </div>
              {!isExpanded && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2
                }}>
                  {previewIcons.map((icon, index) => (
                    <span key={index} style={{ 
                      fontSize: 16,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                    }}>
                      {icon}
                    </span>
                  ))}
                  <span style={{ 
                    fontSize: 14, 
                    color: "#6b7280",
                    fontFamily: "Montserrat, Arial, sans-serif"
                  }}>
                    Одевайся комфортно!
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0
          }}>
            <ChevronIcon isOpen={isExpanded} />
          </div>
        </div>

        {/* Развернутый контент */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid rgba(107, 114, 128, 0.2)"
            }}
          >
            {/* Рекомендации для взрослых */}
            <div style={{
              marginBottom: showChildrenRecommendations ? 16 : 0
            }}>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#374151",
                fontFamily: "Montserrat, Arial, sans-serif",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span>👨‍👩‍👧‍👦</span>
                Для взрослых
              </div>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}>
                {adultRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 12,
                      background: `${rec.color}15`,
                      border: `1px solid ${rec.color}30`,
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background: rec.color,
                      borderRadius: "12px 0 0 12px"
                    }} />

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1
                    }}>
                      <span style={{ 
                        fontSize: 20,
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                      }}>
                        {rec.icon}
                      </span>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#374151",
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {rec.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Рекомендации для детей */}
            {showChildrenRecommendations && childrenRecommendations.length > 0 && (
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <span>👶</span>
                  Для ребенка
                </div>

                {/* Температурное предупреждение */}
                <div style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  marginBottom: 12,
                  border: "1px solid rgba(251, 191, 36, 0.3)"
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#92400e",
                    fontFamily: "Montserrat, Arial, sans-serif"
                  }}>
                    ❄️ Дети мерзнут быстрее взрослых (-3°C к ощущениям)
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 12
                }}>
                  {childrenRecommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: 12,
                        background: `${rec.color}15`,
                        border: `1px solid ${rec.color}30`,
                        position: "relative",
                        overflow: "hidden"
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: rec.color,
                        borderRadius: "12px 0 0 12px"
                      }} />

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1
                      }}>
                        <span style={{ 
                          fontSize: 18,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                        }}>
                          {rec.icon}
                        </span>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#374151",
                          fontFamily: "Montserrat, Arial, sans-serif"
                        }}>
                          {rec.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Совет для родителей */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: 8,
                    border: "1px solid rgba(139, 92, 246, 0.2)"
                  }}
                >
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b46c1",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    marginBottom: 3
                  }}>
                    💡 Совет для родителей
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: "#7c3aed",
                    fontFamily: "Montserrat, Arial, sans-serif"
                  }}>
                    {getParentTip(temp, windSpeed, desc)}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}