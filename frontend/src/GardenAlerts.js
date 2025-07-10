// GardenAlerts.js - Умные алерты для садоводов
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Анализ условий для садоводства
function analyzeGardenConditions(weather, userProfile, forecastData, uvData) {
  if (!weather || !userProfile || !userProfile.interests) return [];
  
  // Проверяем есть ли интерес к садоводству
  const hasGardening = userProfile.interests.some(interest => 
    interest.includes('дача') || 
    interest.includes('садоводство') || 
    interest.includes('garden') ||
    interest.includes('растения')
  );
  
  if (!hasGardening) return [];
  
  const alerts = [];
  const temp = Math.round(weather.main?.temp || weather.temp || 0);
  const humidity = weather.main?.humidity || weather.humidity || 0;
  const windSpeed = Math.round((weather.wind?.speed || 0) * 3.6);
  const pressure = weather.main?.pressure || 1013;
  const rain = weather.rain?.['1h'] || 0;
  const uvIndex = uvData?.uvi || 0;
  
  // 🌱 АЛЕРТЫ ДЛЯ ПОСАДКИ И ПОСЕВА
  if (temp >= 15 && temp <= 25 && humidity > 60 && humidity < 85 && windSpeed < 15 && rain === 0) {
    alerts.push({
      id: 'perfect_planting',
      type: 'excellent',
      icon: '🌱',
      title: 'Идеально для посадки!',
      message: `${temp}°C, влажность ${humidity}% - отличные условия`,
      color: '#10b981',
      bgColor: '#10b98120',
      priority: 10,
      advice: [
        'Высаживайте рассаду',
        'Сейте семена в открытый грунт',
        'Пересаживайте растения'
      ]
    });
  }
  
  // 🌿 АЛЕРТЫ ДЛЯ ПОЛИВА
  if (rain === 0 && humidity < 60 && temp > 20) {
    const intensity = temp > 30 ? 'обильный' : 'умеренный';
    alerts.push({
      id: 'watering_needed',
      type: 'info',
      icon: '🚿',
      title: 'Время полива',
      message: `Сухо ${humidity}%, нужен ${intensity} полив`,
      color: '#06b6d4',
      bgColor: '#06b6d420',
      priority: 8,
      advice: [
        'Поливайте утром или вечером',
        'Проверьте почву на глубине 5см',
        'Больше воды для контейнеров'
      ]
    });
  }
  
  // ❄️ ЗАМОРОЗКИ
  if (temp <= 5) {
    const severity = temp <= 0 ? 'критический' : 'предупреждение';
    alerts.push({
      id: 'frost_warning',
      type: temp <= 0 ? 'critical' : 'warning',
      icon: temp <= 0 ? '🧊' : '❄️',
      title: `Заморозки: ${severity}`,
      message: `${temp}°C - защитите растения`,
      color: temp <= 0 ? '#ef4444' : '#f59e0b',
      bgColor: temp <= 0 ? '#ef444420' : '#f59e0b20',
      priority: temp <= 0 ? 15 : 12,
      advice: [
        'Укройте теплолюбивые растения',
        'Внесите горшки в помещение',
        'Включите обогрев теплицы'
      ]
    });
  }
  
  // 🌧️ ДОЖДИ - польза и проблемы
  if (rain > 0) {
    if (rain < 5) {
      alerts.push({
        id: 'light_rain_benefit',
        type: 'info',
        icon: '🌦️',
        title: 'Лёгкий дождик',
        message: `${rain}мм - естественный полив`,
        color: '#10b981',
        bgColor: '#10b98115',
        priority: 6,
        advice: [
          'Отмените запланированный полив',
          'Время для прополки после дождя',
          'Соберите дождевую воду'
        ]
      });
    } else if (rain > 10) {
      alerts.push({
        id: 'heavy_rain_warning',
        type: 'warning',
        icon: '🌧️',
        title: 'Сильный дождь',
        message: `${rain}мм - риск переувлажнения`,
        color: '#f59e0b',
        bgColor: '#f59e0b20',
        priority: 9,
        advice: [
          'Обеспечьте дренаж',
          'Укройте нежные растения',
          'Не ходите по мокрой почве'
        ]
      });
    }
  }
  
  // ☀️ СОЛНЕЧНЫЕ УСЛОВИЯ
  if (uvIndex >= 6 && temp > 25) {
    alerts.push({
      id: 'sun_protection',
      type: 'warning',
      icon: '☀️',
      title: 'Палящее солнце',
      message: `UV ${uvIndex}, ${temp}°C - защитите растения`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 7,
      advice: [
        'Притените молодые растения',
        'Увеличьте частоту полива',
        'Работайте до 10:00 или после 17:00'
      ]
    });
  }
  
  // 💨 ВЕТЕР
  if (windSpeed > 25) {
    alerts.push({
      id: 'strong_wind',
      type: 'warning',
      icon: '💨',
      title: 'Сильный ветер',
      message: `${windSpeed} км/ч - закрепите растения`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 8,
      advice: [
        'Подвяжите высокие растения',
        'Закройте парники и теплицы',
        'Уберите легкие конструкции'
      ]
    });
  }
  
  // 🌡️ ТЕПЛОВАЯ ВОЛНА
  if (temp > 35) {
    alerts.push({
      id: 'heat_wave',
      type: 'critical',
      icon: '🔥',
      title: 'Экстремальная жара',
      message: `${temp}°C - критично для растений`,
      color: '#ef4444',
      bgColor: '#ef444420',
      priority: 14,
      advice: [
        'Поливайте 2-3 раза в день',
        'Создайте притенение',
        'Мульчируйте почву'
      ]
    });
  }
  
  // 🔍 АНАЛИЗ ПРОГНОЗА НА ЗАВТРА
  if (forecastData && forecastData.length > 0) {
    const tomorrow = forecastData.find(item => {
      const itemDate = new Date(item.dt * 1000);
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      return itemDate.getDate() === tomorrowDate.getDate();
    });
    
    if (tomorrow) {
      const tomorrowTemp = Math.round(tomorrow.main.temp);
      const tomorrowRain = tomorrow.rain?.['3h'] || 0;
      
      // Предупреждение о заморозках завтра
      if (tomorrowTemp <= 2 && temp > 5) {
        alerts.push({
          id: 'tomorrow_frost',
          type: 'warning',
          icon: '🌅',
          title: 'Завтра заморозки',
          message: `Ожидается ${tomorrowTemp}°C - подготовьтесь`,
          color: '#f59e0b',
          bgColor: '#f59e0b15',
          priority: 11,
          advice: [
            'Сегодня укройте растения',
            'Полейте теплой водой вечером',
            'Проверьте укрывной материал'
          ]
        });
      }
      
      // Прогноз хорошей погоды для садовых работ
      if (tomorrowTemp >= 18 && tomorrowTemp <= 28 && tomorrowRain === 0) {
        alerts.push({
          id: 'tomorrow_perfect',
          type: 'prediction',
          icon: '📅',
          title: 'Завтра идеально для сада',
          message: `${tomorrowTemp}°C без дождя - планируйте работы`,
          color: '#10b981',
          bgColor: '#10b98115',
          priority: 5,
          advice: [
            'Запланируйте посадки',
            'Подготовьте инструменты',
            'Составьте список дел'
          ]
        });
      }
    }
  }
  
  // Сортируем по приоритету
  return alerts.sort((a, b) => b.priority - a.priority);
}

// Функция получения цветовой темы
function getGardenTheme(alerts) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical').length;
  const excellentAlerts = alerts.filter(alert => alert.type === 'excellent').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (criticalAlerts > 0) {
    return {
      mainColor: '#ef4444',
      bgColor: '#ef444415',
      iconBgColor: '#ef444410'
    };
  } else if (excellentAlerts > 0) {
    return {
      mainColor: '#10b981',
      bgColor: '#10b98115',
      iconBgColor: '#10b98110'
    };
  } else if (warningAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#22c55e',
      bgColor: '#22c55e15',
      iconBgColor: '#22c55e10'
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

export default function GardenAlerts({ weather, userProfile, forecastData, uvData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzeGardenConditions(weather, userProfile, forecastData, uvData);
  const theme = getGardenTheme(alerts);
  
  // Если нет профиля или интереса к садоводству
  if (!userProfile || !userProfile.interests) {
    return null;
  }
  
  const hasGardening = userProfile.interests.some(interest => 
    interest.includes('дача') || 
    interest.includes('садоводство') || 
    interest.includes('garden') ||
    interest.includes('растения')
  );
  
  if (!hasGardening) {
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
          🌱 Садоводство
        </div>
        <div style={{ fontSize: 14, color: '#9ca3af' }}>
          Анализируем условия...
        </div>
      </div>
    );
  }
  
  // Главный алерт для превью
  const mainAlert = alerts[0];
  const excellentCount = alerts.filter(alert => alert.type === 'excellent').length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
  
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
          : criticalCount > 0 
            ? `2px solid #ef444440`
            : "1px solid rgba(255,255,255,0.2)"
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
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
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
              🌱 {mainAlert.title}
            </div>
            <div style={{
              fontSize: 13,
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