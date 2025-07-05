// Обновленная версия компонента UVIndex с увеличенными иконками и цветным фоном

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения уровня UV индекса
function getUVInfo(uvIndex) {
  if (uvIndex <= 2) {
    return {
      level: "Низкий",
      color: "#10b981",
      bgColor: "#10b98120",
      iconBgColor: "#10b98115",
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
      iconBgColor: "#f59e0b15",
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
      iconBgColor: "#ef444415",
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
      iconBgColor: "#dc262615",
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
      iconBgColor: "#7c2d1215",
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

export default function UVIndex({ uvData, isNight }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      transition={{ duration: 0.6, delay: 0.5 }}
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
              background: `linear-gradient(135deg, ${uvInfo.iconBgColor}, ${uvInfo.bgColor})`,
              border: `1px solid ${uvInfo.color}30`,
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
              background: uvInfo.color,
              borderRadius: "12px 12px 0 0"
            }} />
            
            {/* Крупная иконка */}
            <span style={{ 
              fontSize: 24, // Увеличили размер иконки
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            }}>
              ☀️
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
              UV индекс
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
                  {uvInfo.icon}
                </span>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600,
                  color: uvInfo.color,
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  {uvInfo.level}
                </span>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 700,
                  color: uvInfo.color,
                  fontFamily: "Montserrat, Arial, sans-serif",
                  marginLeft: 4
                }}>
                  {uvIndex}
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
                transition={{ duration: 0.4, delay: 0.1 }}
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
                    fontSize: 32,
                    fontWeight: 800,
                    color: uvInfo.color,
                    fontFamily: "Montserrat, Arial, sans-serif",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    {uvIndex}
                  </div>
                </div>

                <div style={{
                  fontSize: 14,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  lineHeight: 1.4
                }}>
                  {uvInfo.description}
                </div>
              </motion.div>

              {/* Рекомендации в сетке */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8
              }}>
                {/* SPF рекомендация */}
                <motion.div
                  style={{
                    background: `linear-gradient(135deg, ${uvInfo.iconBgColor}, ${uvInfo.bgColor})`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: `1px solid ${uvInfo.color}20`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {/* Тонкая цветная полоска слева */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: uvInfo.color,
                    borderRadius: "8px 0 0 8px"
                  }} />
                  
                  <div style={{
                    fontSize: 13,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    🧴 <strong style={{ color: uvInfo.color }}>{uvInfo.spf}</strong>
                  </div>
                </motion.div>

                {/* Время безопасного пребывания */}
                <motion.div
                  style={{
                    background: `linear-gradient(135deg, ${uvInfo.iconBgColor}, ${uvInfo.bgColor})`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: `1px solid ${uvInfo.color}20`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {/* Тонкая цветная полоска слева */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: uvInfo.color,
                    borderRadius: "8px 0 0 8px"
                  }} />
                  
                  <div style={{
                    fontSize: 13,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    ⏱️ Безопасно на солнце: <strong style={{ color: uvInfo.color }}>{safeTime}</strong>
                  </div>
                </motion.div>

                {/* Основная рекомендация */}
                <motion.div
                  style={{
                    background: `linear-gradient(135deg, ${uvInfo.iconBgColor}, ${uvInfo.bgColor})`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: `1px solid ${uvInfo.color}20`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  {/* Тонкая цветная полоска снизу */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: uvInfo.color,
                    borderRadius: "0 0 8px 8px"
                  }} />
                  
                  <div style={{
                    fontSize: 13,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    💡 {uvInfo.advice}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}