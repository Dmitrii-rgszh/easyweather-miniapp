// Замените весь файл frontend/src/ClothingRecommendations.js на этот код:

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

// SVG стрелка
const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    width="22"
    height="22"
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
        width: "100%",        // 👈 ДОБАВИТЬ
        boxSizing: "border-box", // 👈 ДОБАВИТЬ
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
          gap: 8
        }}>
          <span style={{ fontSize: 16 }}>👔</span>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              Рекомендации одежды
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                gap: 4,
                marginTop: 2
              }}>
                {previewIcons.map((icon, index) => (
                  <span key={index} style={{ fontSize: 16 }}>
                    {icon}
                  </span>
                ))}
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
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 6,
                flexWrap: "wrap"
              }}>
                {recommendations.map((item, index) => (
                  <motion.div
                    key={index}
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 12,
                      padding: "12px 8px",
                      textAlign: "center",
                      border: `2px solid ${item.color}20`,
                      position: "relative",
                      overflow: "hidden",
                      flex: "1 1 auto",
                      minWidth: "60px",
                      maxWidth: "70px"
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
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
                    
                    <div style={{
                      fontSize: 28,
                      lineHeight: 1
                    }}>
                      {item.icon}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Мотивирующий текст */}
              <motion.div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  textAlign: "center",
                  color: "#6b7280",
                  fontStyle: "italic",
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {temp < 0 ? "🥶 Береги себя в мороз!" : 
                 temp > 25 ? "☀️ Отличная погода!" : 
                 "🌤️ Одевайся комфортно!"}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}