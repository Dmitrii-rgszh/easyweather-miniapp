// Создайте файл frontend/src/ClothingRecommendations.js

import React from "react";
import { motion } from "framer-motion";

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

export default function ClothingRecommendations({ temp, desc, humidity, windSpeed, isNight }) {
  const recommendations = getClothingRecommendations(temp, desc, humidity || 50, windSpeed || 0, isNight);

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: "16px",
        margin: "16px auto 0",
        maxWidth: 300,
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 12,
        textAlign: "center",
        fontFamily: "Montserrat, Arial, sans-serif"
      }}>
        👔 Рекомендации одежды
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }}>
        {recommendations.map((item, index) => (
          <motion.div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: 12,
              padding: "10px 8px",
              textAlign: "center",
              border: `2px solid ${item.color}20`,
              position: "relative",
              overflow: "hidden"
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
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
              fontSize: 20,
              marginBottom: 4
            }}>
              {item.icon}
            </div>
            
            <div style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#374151",
              lineHeight: 1.3,
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              {item.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Мотивирующий текст */}
      <motion.div
        style={{
          marginTop: 12,
          fontSize: 16,
          textAlign: "center",
          color: "#6b7280",
          fontStyle: "italic",
          fontFamily: "Montserrat, Arial, sans-serif"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {temp < 0 ? "🥶 Береги себя в мороз!" : 
         temp > 25 ? "☀️ Отличная погода!" : 
         "🌤️ Одевайся комфортно!"}
      </motion.div>
    </motion.div>
  );
}