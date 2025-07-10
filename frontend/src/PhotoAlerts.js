// PhotoAlerts.js - Умные алерты для фотографов природы
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Анализ условий для фотографии
function analyzePhotoConditions(weather, userProfile, forecastData, uvData, astronomyData) {
  if (!weather || !userProfile || !userProfile.interests) return [];
  
  console.log('📷 PhotoAlerts: Начинаем анализ фото условий');
  
  // Проверяем есть ли интерес к фотографии
  const hasPhotography = userProfile.interests.some(interest => 
    interest.includes('фотография') || 
    interest.includes('фото') || 
    interest.includes('photography') ||
    interest.includes('природа')
  );
  
  if (!hasPhotography) return [];
  
  const alerts = [];
  const temp = Math.round(weather.main?.temp || weather.temp || 0);
  const humidity = weather.main?.humidity || weather.humidity || 0;
  const windSpeed = Math.round((weather.wind?.speed || 0) * 3.6);
  const clouds = weather.clouds?.all || 0;

  console.log('📷 PhotoAlerts: Данные погоды:', { temp, humidity, windSpeed, clouds });
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // 🌙 НОЧНОЕ ВРЕМЯ
  if (currentHour >= 22 || currentHour <= 6) {
    if (clouds < 30) {
      alerts.push({
        id: 'astrophotography',
        type: 'excellent',
        icon: '🌟',
        title: 'Ясное небо для звёзд',
        message: `${clouds}% облачности - видны звёзды`,
        color: '#1e293b',
        bgColor: '#1e293b20',
        priority: 13,
        advice: [
          'Ищите места без засветки',
          'Используйте широкоугольный объектив',
          'Штатив обязателен'
        ]
      });
    }
  } else {
    // ДНЕВНОЕ ВРЕМЯ
    if (temp > 30) {
      alerts.push({
        id: 'extreme_heat',
        type: 'warning',
        icon: '🔥',
        title: 'Экстремальная жара',
        message: `${temp}°C - защитите технику`,
        color: '#ef4444',
        bgColor: '#ef444415',
        priority: 10,
        advice: [
          'Снимайте рано утром или вечером',
          'Защитите камеру от перегрева'
        ]
      });
    } else if (temp >= 10 && temp <= 30) {
      alerts.push({
        id: 'good_conditions',
        type: 'info',
        icon: '📸',
        title: 'Хорошие условия для съёмки',
        message: `${temp}°C, подходящая погода`,
        color: '#8b5cf6',
        bgColor: '#8b5cf615',
        priority: 7,
        advice: [
          'Используйте естественное освещение',
          'Экспериментируйте с композицией'
        ]
      });
    }
  }
  
  console.log('📷 PhotoAlerts: Найдено алертов:', alerts.length);
  return alerts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

// Функция получения цветовой темы
function getPhotoTheme(alerts) {
  const excellentAlerts = alerts.filter(alert => alert.type === 'excellent').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (excellentAlerts > 0) {
    return {
      mainColor: '#8b5cf6',
      bgColor: '#8b5cf615',
      iconBgColor: '#8b5cf610'
    };
  } else if (warningAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#6b7280',
      bgColor: '#6b728015',
      iconBgColor: '#6b728010'
    };
  }
}

// SVG иконка стрелки
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

export default function PhotoAlerts({ weather, userProfile, forecastData, uvData, astronomyData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzePhotoConditions(weather, userProfile, forecastData, uvData, astronomyData);
  const theme = getPhotoTheme(alerts);
  
  // Если нет профиля или интереса к фотографии
  if (!userProfile || !userProfile.interests) {
    return null;
  }
  
  const hasPhotography = userProfile.interests.some(interest => 
    interest.includes('фотография') || 
    interest.includes('фото') || 
    interest.includes('photography') ||
    interest.includes('природа')
  );
  
  if (!hasPhotography) {
    return null;
  }
  
  // Если нет алертов - показываем нейтральное сообщение
  if (alerts.length === 0) {
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: 16,
        margin: "16px auto 0",
        maxWidth: 340,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 16, color: '#6b7280' }}>
          📷 Фотография
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Анализируем освещение...
        </div>
      </div>
    );
  }
  
  // Главный алерт для превью
  const mainAlert = alerts[0];
  const excellentCount = alerts.filter(alert => alert.type === 'excellent').length;
  
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
        cursor: "pointer",
        border: excellentCount > 0 
          ? `2px solid ${theme.mainColor}40` 
          : "1px solid rgba(255,255,255,0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
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
        {/* Левая часть */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1
        }}>
          {/* Иконка с анимацией */}
          <motion.div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
              border: `1px solid ${theme.mainColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 18
            }}
            animate={excellentCount > 0 ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 0 8px rgba(139, 92, 246, 0.1)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: excellentCount > 0 ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            {mainAlert.icon}
          </motion.div>

          {/* Текст */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e293b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.2',
              marginBottom: 2
            }}>
              📷 {mainAlert.title}
            </div>
            <div style={{
              fontSize: 14,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.3'
            }}>
              {mainAlert.message}
            </div>
            {alerts.length > 1 && (
              <div style={{
                fontSize: 12,
                color: theme.mainColor,
                fontFamily: 'Montserrat, Arial, sans-serif',
                marginTop: 2,
                fontWeight: 500
              }}>
                +{alerts.length - 1} совет{alerts.length - 1 === 1 ? '' : alerts.length - 1 < 5 ? 'а' : 'ов'}
              </div>
            )}
          </div>
        </div>

        {/* Стрелка */}
        <ChevronIcon isOpen={isExpanded} />
      </div>

      {/* Развернутый контент */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.1)"
          }}
        >
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                background: alert.bgColor,
                borderRadius: 12,
                padding: 12,
                marginBottom: index < alerts.length - 1 ? 8 : 0,
                border: `1px solid ${alert.color}20`
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6
              }}>
                <span style={{ fontSize: 16 }}>{alert.icon}</span>
                <span style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: alert.color,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  {alert.title}
                </span>
              </div>
              
              {alert.advice && (
                <div style={{
                  fontSize: 15,
                  color: '#6b7280',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Советы:</div>
                  {alert.advice.map((tip, tipIndex) => (
                    <div key={tipIndex} style={{ marginBottom: 2 }}>
                      • {tip}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}