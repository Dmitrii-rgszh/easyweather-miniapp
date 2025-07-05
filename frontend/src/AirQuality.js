// Создайте файл frontend/src/AirQuality.js

import React from "react";
import { motion } from "framer-motion";

// Функция определения уровня качества воздуха
function getAirQualityInfo(aqi) {
  switch (aqi) {
    case 1:
      return {
        level: "Отличное",
        color: "#10b981",
        bgColor: "#10b98120",
        icon: "🟢",
        description: "Воздух чистый и свежий",
        advice: "Идеальное время для прогулок и спорта на улице!"
      };
    case 2:
      return {
        level: "Хорошее",
        color: "#84cc16",
        bgColor: "#84cc1620",
        icon: "🟢",
        description: "Качество воздуха приемлемое",
        advice: "Можно проводить время на улице без ограничений"
      };
    case 3:
      return {
        level: "Умеренное",
        color: "#f59e0b",
        bgColor: "#f59e0b20",
        icon: "🟡",
        description: "Умеренное загрязнение",
        advice: "Чувствительным людям стоит ограничить время на улице"
      };
    case 4:
      return {
        level: "Плохое",
        color: "#ef4444",
        bgColor: "#ef444420",
        icon: "🟠",
        description: "Нездоровый воздух",
        advice: "Избегайте длительных прогулок, особенно детям и пожилым"
      };
    case 5:
      return {
        level: "Очень плохое",
        color: "#dc2626",
        bgColor: "#dc262620",
        icon: "🔴",
        description: "Опасное загрязнение",
        advice: "Оставайтесь дома, закройте окна, используйте очистители воздуха"
      };
    default:
      return {
        level: "Неизвестно",
        color: "#6b7280",
        bgColor: "#6b728020",
        icon: "❓",
        description: "Данные недоступны",
        advice: ""
      };
  }
}

// Функция для определения основных загрязнителей
function getPollutantsInfo(components) {
  const pollutants = [
    { 
      name: "CO", 
      value: components.co, 
      unit: "μg/m³", 
      description: "Угарный газ",
      dangerous: components.co > 10000
    },
    { 
      name: "NO₂", 
      value: components.no2, 
      unit: "μg/m³", 
      description: "Диоксид азота",
      dangerous: components.no2 > 200
    },
    { 
      name: "O₃", 
      value: components.o3, 
      unit: "μg/m³", 
      description: "Озон",
      dangerous: components.o3 > 180
    },
    { 
      name: "PM2.5", 
      value: components.pm2_5, 
      unit: "μg/m³", 
      description: "Мелкие частицы",
      dangerous: components.pm2_5 > 25
    }
  ];

  return pollutants.filter(p => p.value > 0);
}

export default function AirQuality({ airQualityData }) {
  if (!airQualityData || !airQualityData.list || airQualityData.list.length === 0) {
    return null;
  }

  const currentAir = airQualityData.list[0];
  const aqi = currentAir.main.aqi;
  const components = currentAir.components;
  
  const airInfo = getAirQualityInfo(aqi);
  const pollutants = getPollutantsInfo(components);

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
      transition={{ duration: 0.6, delay: 0.4 }}
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
        🌬️ Качество воздуха
      </div>

      {/* Основной индикатор */}
      <motion.div
        style={{
          background: airInfo.bgColor,
          borderRadius: 12,
          padding: "12px",
          marginBottom: 12,
          border: `2px solid ${airInfo.color}30`,
          position: "relative",
          overflow: "hidden"
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {/* Цветная полоска сверху */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: airInfo.color,
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
            <span style={{ fontSize: 20 }}>{airInfo.icon}</span>
            <div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: airInfo.color,
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {airInfo.level}
              </div>
              <div style={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                AQI: {aqi}/5
              </div>
            </div>
          </div>
          
          {/* Индикатор уровня */}
          <div style={{
            width: 60,
            height: 8,
            background: "#f3f4f6",
            borderRadius: 4,
            position: "relative",
            overflow: "hidden"
          }}>
            <motion.div
              style={{
                height: "100%",
                background: airInfo.color,
                borderRadius: 4
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(aqi / 5) * 100}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            />
          </div>
        </div>

        <div style={{
          fontSize: 12,
          color: "#374151",
          fontFamily: "Montserrat, Arial, sans-serif",
          lineHeight: 1.4
        }}>
          {airInfo.description}
        </div>
      </motion.div>

      {/* Рекомендация */}
      {airInfo.advice && (
        <motion.div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: "8px 10px",
            marginBottom: 12,
            borderLeft: `3px solid ${airInfo.color}`
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
            💡 {airInfo.advice}
          </div>
        </motion.div>
      )}

      {/* Основные загрязнители */}
      {pollutants.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8
        }}>
          {pollutants.slice(0, 4).map((pollutant, index) => (
            <motion.div
              key={pollutant.name}
              style={{
                background: pollutant.dangerous ? "#fef2f2" : "#f9fafb",
                borderRadius: 8,
                padding: "6px 8px",
                textAlign: "center",
                border: `1px solid ${pollutant.dangerous ? "#fecaca" : "#e5e7eb"}`
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.9 }}
            >
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: pollutant.dangerous ? "#dc2626" : "#374151",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {pollutant.name}
              </div>
              <div style={{
                fontSize: 9,
                color: "#6b7280",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}>
                {Math.round(pollutant.value)} {pollutant.unit}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}