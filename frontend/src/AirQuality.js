// Обновленная версия компонента AirQuality с увеличенными иконками и цветным фоном

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения уровня качества воздуха
function getAirQualityInfo(aqi) {
  switch (aqi) {
    case 1:
      return {
        level: "Отличное",
        color: "#10b981",
        bgColor: "#10b98120",
        iconBgColor: "#10b98115", // Новый цвет для фона иконки
        icon: "🟢",
        description: "Воздух чистый и свежий",
        advice: "Идеальное время для прогулок и спорта на улице!"
      };
    case 2:
      return {
        level: "Хорошее",
        color: "#84cc16",
        bgColor: "#84cc1620",
        iconBgColor: "#84cc1615",
        icon: "🟢",
        description: "Качество воздуха приемлемое",
        advice: "Можно проводить время на улице без ограничений"
      };
    case 3:
      return {
        level: "Умеренное",
        color: "#f59e0b",
        bgColor: "#f59e0b20",
        iconBgColor: "#f59e0b15",
        icon: "🟡",
        description: "Умеренное загрязнение",
        advice: "Чувствительным людям стоит ограничить время на улице"
      };
    case 4:
      return {
        level: "Плохое",
        color: "#ef4444",
        bgColor: "#ef444420",
        iconBgColor: "#ef444415",
        icon: "🟠",
        description: "Нездоровый воздух",
        advice: "Избегайте длительных прогулок, особенно детям и пожилым"
      };
    case 5:
      return {
        level: "Очень плохое",
        color: "#dc2626",
        bgColor: "#dc262620",
        iconBgColor: "#dc262615",
        icon: "🔴",
        description: "Опасное загрязнение",
        advice: "Оставайтесь дома, закройте окна, используйте очистители воздуха"
      };
    default:
      return {
        level: "Неизвестно",
        color: "#6b7280",
        bgColor: "#6b728020",
        iconBgColor: "#6b728015",
        icon: "❓",
        description: "Данные недоступны",
        advice: ""
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

export default function AirQuality({ airQualityData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!airQualityData || !airQualityData.list || airQualityData.list.length === 0) {
    return null;
  }

  const currentAir = airQualityData.list[0];
  const aqi = currentAir.main.aqi;
  const components = currentAir.components;
  
  const airInfo = getAirQualityInfo(aqi);

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
      transition={{ duration: 0.6, delay: 0.4 }}
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
              background: `linear-gradient(135deg, ${airInfo.iconBgColor}, ${airInfo.bgColor})`,
              border: `1px solid ${airInfo.color}30`,
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
              background: airInfo.color,
              borderRadius: "12px 12px 0 0"
            }} />
            
            {/* Крупная иконка */}
            <span style={{ 
              fontSize: 24, // Увеличили размер иконки
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            }}>
              🌬️
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
              Качество воздуха
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2
              }}>
                <span style={{ 
                  fontSize: 16, // Увеличили размер статус-иконки
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                }}>
                  {airInfo.icon}
                </span>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600,
                  color: airInfo.color,
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  {airInfo.level}
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
                transition={{ duration: 0.4, delay: 0.1 }}
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
                        fontSize: 14,
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
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                <div style={{
                  fontSize: 16,
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
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div style={{
                    fontSize: 14,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.4
                  }}>
                    💡 {airInfo.advice}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}