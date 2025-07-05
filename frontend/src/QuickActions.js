// Создайте файл frontend/src/QuickActions.js

import React from "react";
import { motion } from "framer-motion";

export default function QuickActions({ weather, onShareWeather, onSaveToFavorites }) {
  const quickActions = [
    {
      icon: "📱",
      label: "Поделиться",
      action: () => onShareWeather(weather),
      color: "#059669"
    },
    {
      icon: "⭐",
      label: "В избранное",
      action: () => onSaveToFavorites(weather.city),
      color: "#f59e0b"
    },
    {
      icon: "📍",
      label: "На карте",
      action: () => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(weather.city)}`),
      color: "#3b82f6"
    },
    {
      icon: "🔄",
      label: "Обновить",
      action: () => window.location.reload(),
      color: "#8b5cf6"
    }
  ];

  return (
    <motion.div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        margin: "16px auto 0",
        maxWidth: 300
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {quickActions.map((action, index) => (
        <motion.button
          key={index}
          onClick={action.action}
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: `2px solid ${action.color}30`,
            borderRadius: 12,
            width: 80,     // 👈 ИЗМЕНИТЬ с 72 на 80 (фиксированная ширина)
            height: 80,    // 👈 ИЗМЕНИТЬ с 72 на 80 (фиксированная высота)
            minWidth: 80,  // 👈 ДОБАВИТЬ - минимальная ширина
            maxWidth: 80,  // 👈 ДОБАВИТЬ - максимальная ширина
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s",
            flexShrink: 0  // 👈 ДОБАВИТЬ - не сжимается
          }}
          whileHover={{ 
            scale: 1.1,
            backgroundColor: `${action.color}20`
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.9 }}
        >
          <div style={{ fontSize: 20, marginBottom: 2 }}>
            {action.icon}
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#374151",
            fontFamily: "Montserrat, Arial, sans-serif",
            textAlign: "center",
            lineHeight: 1.2,  // 👈 ДОБАВИТЬ - межстрочный интервал
            whiteSpace: "nowrap", // 👈 ДОБАВИТЬ - текст не переносится
            overflow: "hidden",   // 👈 ДОБАВИТЬ - скрываем лишний текст
            textOverflow: "ellipsis"
          }}>
            {action.label}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}