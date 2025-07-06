// Обновленная версия компонента QuickActions с увеличенными иконками и цветным фоном

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция определения основной темы блока
function getQuickActionsTheme() {
  return {
    mainColor: "#6366f1",
    bgColor: "#6366f115",
    iconBgColor: "#6366f110"
  };
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

export default function QuickActions({ weather, onShareWeather, onSaveToFavorites, onOpenAdminPanel }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = getQuickActionsTheme();

  if (!weather) return null;

  const quickActions = [
    {
      icon: "📱",
      label: "Поделиться",
      action: () => onShareWeather(weather),
      color: "#059669",
      bgColor: "#05966915",
      iconBgColor: "#05966910",
      description: "Отправить данные о погоде"
    },
    {
      icon: "⭐",
      label: "В избранное",
      action: () => onSaveToFavorites(weather.city),
      color: "#f59e0b",
      bgColor: "#f59e0b15",
      iconBgColor: "#f59e0b10",
      description: "Добавить/убрать из избранного"
    },
    {
      icon: "📍",
      label: "На карте",
      action: () => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(weather.city)}`),
      color: "#3b82f6",
      bgColor: "#3b82f615",
      iconBgColor: "#3b82f610",
      description: "Открыть на Яндекс Картах"
    },
    {
      icon: "🔄",
      label: "Обновить",
      action: () => window.location.reload(),
      color: "#8b5cf6",
      bgColor: "#8b5cf615",
      iconBgColor: "#8b5cf610",
      description: "Обновить данные"
    },
    {
      icon: "📋",
      label: "Копировать",
      action: () => {
        const weatherText = `🌤️ Погода в ${weather.city}: ${weather.temp}°, ${weather.desc.toLowerCase()}`;
        navigator.clipboard.writeText(weatherText).then(() => {
          alert('Данные о погоде скопированы в буфер обмена!');
        }).catch(() => {
          alert('Не удалось скопировать данные');
        });
      },
      color: "#ef4444",
      bgColor: "#ef444415",
      iconBgColor: "#ef444410",
      description: "Скопировать в буфер обмена"
    },
    {
      icon: "🌐",
      label: "Подробнее",
      action: () => window.open(`https://yandex.ru/pogoda/search?text=${encodeURIComponent(weather.city)}`),
      color: "#10b981",
      bgColor: "#10b98115",
      iconBgColor: "#10b98110",
      description: "Подробный прогноз"
    },
    
    {
      icon: "🔐",
      label: "Админ панель",
      action: () => {
        // ЗАМЕНИТЕ ЭТОТ action НА:
        console.log('🔐 Кнопка админки нажата!');
        console.log('onOpenAdminPanel функция:', onOpenAdminPanel);
        alert('Тест: кнопка админки работает!');
    
        if (onOpenAdminPanel) {
          console.log('Вызываем onOpenAdminPanel...');
          onOpenAdminPanel();
        } else {
          alert('❌ onOpenAdminPanel не передан!');
        }
      },
      color: "#dc3545",
      bgColor: "#dc354515",
      iconBgColor: "#dc354510",
      description: "Панель администратора"
    }
  ];

  // Первые 4 действия для превью
  const previewActions = quickActions.slice(0, 4);
  const additionalActions = quickActions.slice(4);

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
      transition={{ duration: 0.6, delay: 0.8 }}
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
              ⚡
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
              Быстрые действия
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                gap: 4,
                marginTop: 2,
                alignItems: "center"
              }}>
                {previewActions.slice(0, 3).map((action, index) => (
                  <motion.span 
                    key={index} 
                    style={{ 
                      fontSize: 16, // Увеличили размер превью-иконок
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.8 }}
                  >
                    {action.icon}
                  </motion.span>
                ))}
                <span style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  marginLeft: 2
                }}>
                  +{quickActions.length - 3}
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
            onClick={(e) => e.stopPropagation()} // Предотвращаем сворачивание при клике на кнопки
          >
            <div style={{ marginTop: 16 }}>
              
              {/* Основные действия */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: 12
              }}>
                {previewActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${action.iconBgColor}, ${action.bgColor})`,
                      border: `2px solid ${action.color}30`,
                      borderRadius: 12,
                      padding: "12px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 80
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Цветной акцент */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: action.color,
                      borderRadius: "12px 12px 0 0"
                    }} />
                    
                    {/* Иконка */}
                    <div style={{
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 6,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}>
                      {action.icon}
                    </div>
                    
                    {/* Название */}
                    <div style={{
                      fontSize: 14,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      textAlign: "center"
                    }}>
                      {action.label}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Дополнительные действия */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: 12
              }}>
                {additionalActions.map((action, index) => (
                  <motion.button
                    key={index + 4}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${action.iconBgColor}, ${action.bgColor})`,
                      border: `2px solid ${action.color}30`,
                      borderRadius: 12,
                      padding: "12px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 80
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (index + 4) * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Цветной акцент */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: action.color,
                      borderRadius: "12px 12px 0 0"
                    }} />
                    
                    {/* Иконка */}
                    <div style={{
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 6,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    }}>
                      {action.icon}
                    </div>
                    
                    {/* Название */}
                    <div style={{
                      fontSize: 14,
                      color: "#374151",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      textAlign: "center"
                    }}>
                      {action.label}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Итоговое сообщение */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: `1px solid ${theme.mainColor}20`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
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
                  fontSize: 14,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500,
                  textAlign: "center"
                }}>
                  ⚡ {quickActions.length} быстрых действий доступно
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}