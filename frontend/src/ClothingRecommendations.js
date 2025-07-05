// Обновленная версия компонента ClothingRecommendations с увеличенными иконками и цветным фоном

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения рекомендаций одежды
function getClothingRecommendations(temp, desc, humidity, windSpeed, isNight) {
  const recommendations = [];
  
  // Базовая одежда по температуре
  if (temp < -10) {
    recommendations.push({
      icon: "🧥",
      text: "Теплая зимняя куртка",
      color: "#1e40af",
      priority: 1
    });
    recommendations.push({
      icon: "🧤",
      text: "Перчатки и шапка",
      color: "#7c3aed",
      priority: 1
    });
    recommendations.push({
      icon: "👢",
      text: "Теплая обувь",
      color: "#059669",
      priority: 1
    });
  } else if (temp < 0) {
    recommendations.push({
      icon: "🧥",
      text: "Зимняя куртка",
      color: "#1e40af",
      priority: 1
    });
    recommendations.push({
      icon: "🧣",
      text: "Шарф и шапка",
      color: "#7c3aed",
      priority: 2
    });
  } else if (temp < 10) {
    recommendations.push({
      icon: "🧥",
      text: "Теплая куртка",
      color: "#2563eb",
      priority: 1
    });
    recommendations.push({
      icon: "👖",
      text: "Длинные брюки",
      color: "#059669",
      priority: 2
    });
  } else if (temp < 20) {
    recommendations.push({
      icon: "🧥",
      text: "Легкая куртка",
      color: "#0891b2",
      priority: 2
    });
    recommendations.push({
      icon: "👕",
      text: "Свитер или кофта",
      color: "#7c3aed",
      priority: 2
    });
  } else if (temp < 25) {
    recommendations.push({
      icon: "👕",
      text: "Легкая одежда",
      color: "#059669",
      priority: 2
    });
    recommendations.push({
      icon: "👟",
      text: "Удобная обувь",
      color: "#0891b2",
      priority: 3
    });
  } else {
    recommendations.push({
      icon: "👕",
      text: "Легкая футболка",
      color: "#059669",
      priority: 2
    });
    recommendations.push({
      icon: "🩳",
      text: "Шорты",
      color: "#0891b2",
      priority: 2
    });
    recommendations.push({
      icon: "🕶️",
      text: "Солнцезащитные очки",
      color: "#f59e0b",
      priority: 3
    });
  }

  // Дополнительные рекомендации по погодным условиям
  if (desc.toLowerCase().includes('дожд') || desc.toLowerCase().includes('rain')) {
    recommendations.push({
      icon: "🌂",
      text: "Зонт обязательно!",
      color: "#dc2626",
      priority: 1
    });
    recommendations.push({
      icon: "🥾",
      text: "Водонепроницаемая обувь",
      color: "#7c3aed",
      priority: 2
    });
  }

  if (desc.toLowerCase().includes('снег') || desc.toLowerCase().includes('snow')) {
    recommendations.push({
      icon: "❄️",
      text: "Защита от снега",
      color: "#0891b2",
      priority: 1
    });
  }

  if (windSpeed > 10) {
    recommendations.push({
      icon: "🌬️",
      text: "Ветрозащитная одежда",
      color: "#6366f1",
      priority: 2
    });
  }

  if (humidity > 80) {
    recommendations.push({
      icon: "💧",
      text: "Дышащие материалы",
      color: "#0891b2",
      priority: 3
    });
  }

  if (isNight) {
    recommendations.push({
      icon: "🌙",
      text: "Светоотражающие элементы",
      color: "#7c3aed",
      priority: 3
    });
  }

  // Сортируем по приоритету и берем топ-4
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);
}

// Функция определения основной цветовой темы блока
function getClothingTheme(temp, desc) {
  if (temp < -10) {
    return {
      mainColor: "#1e40af",
      bgColor: "#1e40af15",
      iconBgColor: "#1e40af10"
    };
  } else if (temp < 0) {
    return {
      mainColor: "#2563eb",
      bgColor: "#2563eb15",
      iconBgColor: "#2563eb10"
    };
  } else if (temp < 10) {
    return {
      mainColor: "#0891b2",
      bgColor: "#0891b215",
      iconBgColor: "#0891b210"
    };
  } else if (temp < 20) {
    return {
      mainColor: "#059669",
      bgColor: "#05966915",
      iconBgColor: "#05966910"
    };
  } else if (temp < 25) {
    return {
      mainColor: "#7c3aed",
      bgColor: "#7c3aed15",
      iconBgColor: "#7c3aed10"
    };
  } else {
    return {
      mainColor: "#f59e0b",
      bgColor: "#f59e0b15",
      iconBgColor: "#f59e0b10"
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

export default function ClothingRecommendations({ temp, desc, humidity, windSpeed, isNight }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const recommendations = getClothingRecommendations(temp, desc, humidity || 50, windSpeed || 0, isNight);
  const theme = getClothingTheme(temp, desc);

  if (recommendations.length === 0) return null;

  // Берем первые 2 иконки для превью
  const previewIcons = recommendations.slice(0, 2).map(item => item.icon);

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
              👔
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
              Рекомендации одежды
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                gap: 6,
                marginTop: 2,
                alignItems: "center"
              }}>
                {previewIcons.map((icon, index) => (
                  <motion.span 
                    key={index} 
                    style={{ 
                      fontSize: 16, // Увеличили размер превью-иконок
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {icon}
                  </motion.span>
                ))}
                {recommendations.length > 2 && (
                  <span style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    marginLeft: 2
                  }}>
                    +{recommendations.length - 2}
                  </span>
                )}
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
              {/* Сетка рекомендаций */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
                gap: 8,
                marginBottom: 12
              }}>
                {recommendations.map((item, index) => (
                  <motion.div
                    key={index}
                    style={{
                      background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
                      borderRadius: 12,
                      padding: "12px 8px",
                      textAlign: "center",
                      border: `2px solid ${item.color}20`,
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 80
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {/* Цветной акцент */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: item.color,
                      borderRadius: "12px 12px 0 0"
                    }} />
                    
                    {/* Иконка */}
                    <div style={{
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 6,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}>
                      {item.icon}
                    </div>
                    
                    {/* Описание */}
                    <div style={{
                      fontSize: 10,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontWeight: 500,
                      lineHeight: 1.2
                    }}>
                      {item.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Мотивирующий текст с цветным фоном */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  textAlign: "center",
                  border: `1px solid ${theme.mainColor}20`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* Тонкая цветная полоска */}
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
                  fontSize: 14,
                  color: "#374151",
                  fontStyle: "italic",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500
                }}>
                  {temp < -5 ? "🥶 Береги себя в мороз!" : 
                   temp < 5 ? "❄️ Тепло одевайся!" :
                   temp < 15 ? "🧥 Не забудь куртку!" :
                   temp > 25 ? "☀️ Отличная погода!" : 
                   "🌤️ Одевайся комфортно!"}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}