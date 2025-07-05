// Создайте файл frontend/src/UVIndex.js

import React from "react";
import { motion } from "framer-motion";

// Функция определения уровня UV индекса
function getUVInfo(uvIndex) {
  if (uvIndex <= 2) {
    return {
      level: "Низкий",
      color: "#10b981",
      bgColor: "#10b98120",
      icon: "🟢",
      description: "Минимальный риск",
      advice: "Можно находиться на солнце без защиты",
      spf: "Защита не требуется"
    };
  } else if (uvIndex <= 5) {
    return {
      level: "Умеренный",
      color: "#f59e0b",
      bgColor: "#f59e0b20",
      icon: "🟡",
      description: "Умеренный риск",
      advice: "Используйте солнцезащитный крем при длительном пребывании",
      spf: "SPF 15+"
    };
  } else if (uvIndex <= 7) {
    return {
      level: "Высокий",
      color: "#ef4444",
      bgColor: "#ef444420",
      icon: "🟠",
      description: "Высокий риск ожогов",
      advice: "Защищайте кожу, избегайте солнца в полдень",
      spf: "SPF 30+"
    };
  } else if (uvIndex <= 10) {
    return {
      level: "Очень высокий",
      color: "#dc2626",
      bgColor: "#dc262620",
      icon: "🔴",
      description: "Очень высокий риск",
      advice: "Обязательно используйте защиту, ограничьте время на солнце",
      spf: "SPF 50+"
    };
  } else {
    return {
      level: "Экстремальный",
      color: "#7c2d12",
      bgColor: "#7c2d1220",
      icon: "🟣",
      description: "Экстремальный риск",
      advice: "Избегайте пребывания на солнце, оставайтесь в тени",
      spf: "SPF 50+ обязательно"
    };
  }
}

// Функция для времени безопасного пребывания на солнце
function getSafeTime(uvIndex) {
  if (uvIndex <= 2) return "Более 60 минут";
  if (uvIndex <= 5) return "30-60 минут";
  if (uvIndex <= 7) return "15-25 минут";
  if (uvIndex <= 10) return "10-15 минут";
  return "Менее 10 минут";
}

export default function UVIndex({ uvData, isNight }) {
  if (!uvData || isNight) {
    return null; // Не показываем UV индекс ночью
  }

  const uvIndex = Math.round(uvData.value || 0);
  const uvInfo = getUVInfo(uvIndex);
  const safeTime = getSafeTime(uvIndex);

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
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Заголовок */}
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 12,
        textAlign: "center",
        fontFamily: "Montserrat, Arial, sans-serif"
      }}>
        ☀️ UV индекс
      </div>

      {/* Основной индикатор */}
      <motion.div
        style={{
          background: uvInfo.bgColor,
          borderRadius: 12,
          padding: "12px",
          marginBottom: 12,
          border: `2px solid ${uvInfo.color}30`,
          position: "relative",
          overflow: "hidden"
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        {/* Цветная полоска сверху */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: uvInfo.color,
          borderRadius: "12px 12px 0 0"
        }} />

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <span style={{ fontSize: 20 }}>{uvInfo.icon}</span>
            <div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: uvInfo.color,
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {uvInfo.level}
              </div>
              <div style={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                UV: {uvIndex}/11+
              </div>
            </div>
          </div>
          
          {/* Большая цифра UV индекса */}
          <div style={{
            fontSize: 24,
            fontWeight: 800,
            color: uvInfo.color,
            fontFamily: "Montserrat, Arial, sans-serif"
          }}>
            {uvIndex}
          </div>
        </div>

        <div style={{
          fontSize: 12,
          color: "#374151",
          fontFamily: "Montserrat, Arial, sans-serif",
          lineHeight: 1.4
        }}>
          {uvInfo.description}
        </div>
      </motion.div>

      {/* Рекомендации */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 8
      }}>
        {/* SPF рекомендация */}
        <motion.div
          style={{
            background: "#fef3cd",
            borderRadius: 8,
            padding: "8px 10px",
            borderLeft: `3px solid ${uvInfo.color}`
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div style={{
            fontSize: 11,
            color: "#374151",
            fontFamily: "Montserrat, Arial, sans-serif",
            lineHeight: 1.4
          }}>
            🧴 <strong>{uvInfo.spf}</strong>
          </div>
        </motion.div>

        {/* Время безопасного пребывания */}
        <motion.div
          style={{
            background: "#f0f9ff",
            borderRadius: 8,
            padding: "8px 10px",
            borderLeft: `3px solid ${uvInfo.color}`
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <div style={{
            fontSize: 11,
            color: "#374151",
            fontFamily: "Montserrat, Arial, sans-serif",
            lineHeight: 1.4
          }}>
            ⏱️ Безопасно на солнце: <strong>{safeTime}</strong>
          </div>
        </motion.div>

        {/* Основная рекомендация */}
        <motion.div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: "8px 10px",
            borderLeft: `3px solid ${uvInfo.color}`
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
        >
          <div style={{
            fontSize: 11,
            color: "#374151",
            fontFamily: "Montserrat, Arial, sans-serif",
            lineHeight: 1.4
          }}>
            💡 {uvInfo.advice}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}