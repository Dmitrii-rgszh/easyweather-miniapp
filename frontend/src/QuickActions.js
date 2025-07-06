import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function QuickActions({ 
  weather, 
  onShareWeather, 
  onSaveToFavorites, 
  onOpenAdminPanel, 
  onOpenProfile, // Новый пропс для открытия профиля
  userProfile // Пропс для определения статуса профиля
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather) return null;

  // Определяем статус профиля
  const isProfileCompleted = userProfile?.setupCompleted || false;

  const actions = [
    {
      id: 'profile',
      icon: isProfileCompleted ? '👤' : '👤',
      text: 'Профиль',
      color: isProfileCompleted ? '#059669' : '#6b7280',
      bgColor: isProfileCompleted ? '#059669' : '#6b7280',
      action: onOpenProfile,
      badge: isProfileCompleted ? '✅' : '❓',
      description: isProfileCompleted ? 'Персонализация настроена' : 'Настроить профиль'
    },
    {
      id: 'share',
      icon: '📤',
      text: 'Поделиться',
      color: '#3b82f6',
      bgColor: '#3b82f6',
      action: () => onShareWeather(weather)
    },
    {
      id: 'favorites',
      icon: '⭐',
      text: 'В избранное',
      color: '#f59e0b',
      bgColor: '#f59e0b',
      action: () => onSaveToFavorites(weather.city)
    },
    {
      id: 'admin',
      icon: '⚙️',
      text: 'Админка',
      color: '#8b5cf6',
      bgColor: '#8b5cf6',
      action: onOpenAdminPanel
    }
  ];

  // Для превью берем первые 3 иконки
  const previewActions = actions.slice(0, 3);

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
      transition={{ duration: 0.6, delay: 1.0 }}
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
          {/* Контейнер иконки */}
          <motion.div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b15, #f59e0b10)",
              border: "1px solid #f59e0b30",
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
              background: "#f59e0b",
              borderRadius: "12px 12px 0 0"
            }} />
            
            {/* Иконка */}
            <span style={{ 
              fontSize: 24,
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
                gap: 6,
                marginTop: 2,
                alignItems: "center"
              }}>
                {previewActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center"
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <span style={{ 
                      fontSize: 16,
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                    }}>
                      {action.icon}
                    </span>
                    {/* Бейдж для профиля */}
                    {action.id === 'profile' && action.badge && (
                      <motion.span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          fontSize: 10,
                          background: action.color,
                          color: 'white',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {isProfileCompleted ? '✓' : '?'}
                      </motion.span>
                    )}
                  </motion.div>
                ))}
                {actions.length > 3 && (
                  <span style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    marginLeft: 2
                  }}>
                    +{actions.length - 3}
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
              {/* Сетка действий */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginBottom: 12
              }}>
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${action.bgColor}10, ${action.bgColor}05)`,
                      borderRadius: 12,
                      padding: "16px 12px",
                      textAlign: "center",
                      border: `2px solid ${action.bgColor}20`,
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 80,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
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
                      background: action.bgColor,
                      borderRadius: "12px 12px 0 0"
                    }} />
                    
                    {/* Контейнер для иконки и бейджа */}
                    <div style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <span style={{
                        fontSize: 28,
                        lineHeight: 1,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      }}>
                        {action.icon}
                      </span>
                      
                      {/* Бейдж для статуса профиля */}
                      {action.id === 'profile' && (
                        <motion.div
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: isProfileCompleted ? '#059669' : '#ef4444',
                            color: 'white',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {isProfileCompleted ? '✓' : '!'}
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Текст */}
                    <div>
                      <div style={{
                        fontSize: 14,
                        color: "#374151",
                        fontFamily: "Montserrat, Arial, sans-serif",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: action.description ? 4 : 0
                      }}>
                        {action.text}
                      </div>
                      
                      {/* Описание для профиля */}
                      {action.description && (
                        <div style={{
                          fontSize: 11,
                          color: action.color,
                          fontFamily: "Montserrat, Arial, sans-serif",
                          fontWeight: 500,
                          lineHeight: 1.1
                        }}>
                          {action.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Мотивирующий текст */}
              <motion.div
                style={{
                  background: "linear-gradient(135deg, #f59e0b15, #f59e0b10)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  textAlign: "center",
                  border: "1px solid #f59e0b20",
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
                  background: "#f59e0b",
                  borderRadius: "0 0 8px 8px"
                }} />
                
                <div style={{
                  fontSize: 14,
                  color: "#374151",
                  fontStyle: "italic",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500
                }}>
                  {isProfileCompleted 
                    ? "🎯 Персонализация активна! Получайте умные советы" 
                    : "💡 Настройте профиль для персональных рекомендаций"
                  }
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}