// Компонент WeatherAlerts - система погодных предупреждений

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция анализа погодных условий и генерации алертов
function generateWeatherAlerts(weather, airQuality, uvData, forecast) {
  const alerts = [];
  
  if (!weather) return alerts;

  const temp = weather.temp;
  const desc = weather.desc.toLowerCase();
  const humidity = weather.details?.humidity || 0;
  const windSpeed = parseFloat(weather.details?.wind?.replace(' м/с', '') || '0');
  const pressure = weather.details?.pressure || 760;

  // 🌡️ ТЕМПЕРАТУРНЫЕ АЛЕРТЫ
  if (temp <= -15) {
    alerts.push({
      id: 'extreme_cold',
      type: 'critical',
      icon: '🥶',
      title: 'Экстремальный холод',
      message: 'Температура ниже -15°C. Избегайте длительного пребывания на улице!',
      color: '#1e40af',
      bgColor: '#1e40af15',
      iconBgColor: '#1e40af10',
      priority: 1,
      actions: ['Теплая одежда обязательна', 'Ограничьте время на улице', 'Защитите открытые участки кожи']
    });
  } else if (temp >= 35) {
    alerts.push({
      id: 'extreme_heat',
      type: 'critical',
      icon: '🔥',
      title: 'Экстремальная жара',
      message: 'Температура выше 35°C. Риск теплового удара!',
      color: '#dc2626',
      bgColor: '#dc262615',
      iconBgColor: '#dc262610',
      priority: 1,
      actions: ['Пейте больше воды', 'Избегайте прямого солнца', 'Ограничьте физическую активность']
    });
  } else if (temp >= 30) {
    alerts.push({
      id: 'high_heat',
      type: 'warning',
      icon: '☀️',
      title: 'Сильная жара',
      message: 'Высокая температура. Соблюдайте осторожность на солнце.',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10',
      priority: 2,
      actions: ['Используйте солнцезащитный крем', 'Носите легкую одежду', 'Избегайте полуденного солнца']
    });
  }

  // 🌧️ ОСАДКИ И СТИХИЯ
  if (desc.includes('дожд') && windSpeed > 15) {
    alerts.push({
      id: 'storm',
      type: 'critical',
      icon: '⛈️',
      title: 'Шторм',
      message: 'Сильный дождь с ветром. Избегайте поездок и прогулок!',
      color: '#7c2d12',
      bgColor: '#7c2d1215',
      iconBgColor: '#7c2d1210',
      priority: 1,
      actions: ['Оставайтесь дома', 'Избегайте деревьев', 'Отложите поездки']
    });
  } else if (desc.includes('дожд')) {
    alerts.push({
      id: 'rain',
      type: 'info',
      icon: '🌧️',
      title: 'Дождь',
      message: 'Ожидается дождь. Не забудьте зонт!',
      color: '#3b82f6',
      bgColor: '#3b82f615',
      iconBgColor: '#3b82f610',
      priority: 3,
      actions: ['Возьмите зонт', 'Водонепроницаемая обувь', 'Будьте осторожны на дороге']
    });
  }

  if (desc.includes('снег') && temp < -5) {
    alerts.push({
      id: 'heavy_snow',
      type: 'warning',
      icon: '❄️',
      title: 'Сильный снегопад',
      message: 'Снег при низкой температуре. Возможна гололедица!',
      color: '#0891b2',
      bgColor: '#0891b215',
      iconBgColor: '#0891b210',
      priority: 2,
      actions: ['Противоскользящая обувь', 'Осторожно на дороге', 'Больше времени на дорогу']
    });
  }

  // 💨 ВЕТЕР
  if (windSpeed >= 20) {
    alerts.push({
      id: 'strong_wind',
      type: 'warning',
      icon: '💨',
      title: 'Сильный ветер',
      message: `Ветер ${windSpeed} м/с. Будьте осторожны с высокими объектами!`,
      color: '#6366f1',
      bgColor: '#6366f115',
      iconBgColor: '#6366f110',
      priority: 2,
      actions: ['Избегайте деревьев', 'Закрепите легкие предметы', 'Осторожно с зонтами']
    });
  }

  // 🌫️ ТУМАН И ВИДИМОСТЬ
  if (desc.includes('туман') || humidity > 95) {
    alerts.push({
      id: 'fog',
      type: 'warning',
      icon: '🌫️',
      title: 'Туман',
      message: 'Ограниченная видимость. Будьте осторожны на дороге!',
      color: '#6b7280',
      bgColor: '#6b728015',
      iconBgColor: '#6b728010',
      priority: 2,
      actions: ['Включите фары', 'Снизьте скорость', 'Увеличьте дистанцию']
    });
  }

  // 🌬️ КАЧЕСТВО ВОЗДУХА
  if (airQuality && airQuality.list && airQuality.list[0]) {
    const aqi = airQuality.list[0].main.aqi;
    if (aqi >= 4) {
      alerts.push({
        id: 'air_quality',
        type: 'warning',
        icon: '😷',
        title: 'Плохое качество воздуха',
        message: 'Высокий уровень загрязнения. Ограничьте время на улице!',
        color: '#ef4444',
        bgColor: '#ef444415',
        iconBgColor: '#ef444410',
        priority: 2,
        actions: ['Носите маску', 'Закройте окна', 'Ограничьте физическую активность']
      });
    }
  }

  // ☀️ UV ИНДЕКС
  if (uvData && uvData.value >= 8) {
    alerts.push({
      id: 'uv_high',
      type: 'warning',
      icon: '🕶️',
      title: 'Высокий UV индекс',
      message: 'Очень высокий уровень UV излучения. Защитите кожу!',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10',
      priority: 2,
      actions: ['SPF 50+ обязательно', 'Солнцезащитные очки', 'Избегайте полуденного солнца']
    });
  }

  // 📊 ДАВЛЕНИЕ
  if (pressure < 720) {
    alerts.push({
      id: 'low_pressure',
      type: 'info',
      icon: '📉',
      title: 'Низкое давление',
      message: 'Пониженное атмосферное давление. Метеочувствительные люди могут чувствовать дискомфорт.',
      color: '#8b5cf6',
      bgColor: '#8b5cf615',
      iconBgColor: '#8b5cf610',
      priority: 3,
      actions: ['Больше отдыха', 'Избегайте стресса', 'Пейте больше воды']
    });
  }

  // Сортируем по приоритету
  return alerts.sort((a, b) => a.priority - b.priority);
}

// Функция определения общей темы блока алертов
function getAlertsTheme(alerts) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (criticalAlerts > 0) {
    return {
      mainColor: '#dc2626',
      bgColor: '#dc262615',
      iconBgColor: '#dc262610'
    };
  } else if (warningAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#3b82f6',
      bgColor: '#3b82f615',
      iconBgColor: '#3b82f610'
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

export default function WeatherAlerts({ weather, airQuality, uvData, forecast }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = generateWeatherAlerts(weather, airQuality, uvData, forecast);
  const theme = getAlertsTheme(alerts);
  
  // Если нет алертов, не показываем блок
  if (alerts.length === 0) {
    return null;
  }

  // Самый критичный алерт для превью
  const mainAlert = alerts[0];
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
  const warningCount = alerts.filter(alert => alert.type === 'warning').length;

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
      transition={{ duration: 0.6, delay: 0.2 }}
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
              width: 48,
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
            animate={criticalCount > 0 ? {
              boxShadow: [
                "0 0 0 0 rgba(220, 38, 38, 0.4)",
                "0 0 0 8px rgba(220, 38, 38, 0)",
                "0 0 0 0 rgba(220, 38, 38, 0.4)"
              ]
            } : {}}
          >
            {/* Декоративная полоска с анимацией для критичных алертов */}
            <motion.div 
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: theme.mainColor,
                borderRadius: "12px 12px 0 0"
              }}
              animate={criticalCount > 0 ? {
                opacity: [1, 0.3, 1]
              } : {}}
              transition={criticalCount > 0 ? {
                duration: 1.5,
                repeat: Infinity
              } : {}}
            />
            
            {/* Крупная иконка */}
            <span style={{ 
              fontSize: 24,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            }}>
              🚨
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
              Погодные алерты
            </div>
            {!isExpanded && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2
              }}>
                <span style={{ 
                  fontSize: 16,
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
                }}>
                  {mainAlert.icon}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600,
                  color: mainAlert.color,
                  fontFamily: "Montserrat, Arial, sans-serif"
                }}>
                  {mainAlert.title}
                </span>
                {alerts.length > 1 && (
                  <span style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    marginLeft: 2
                  }}>
                    +{alerts.length - 1}
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
              
              {/* Список всех алертов */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 12
              }}>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    style={{
                      background: `linear-gradient(135deg, ${alert.iconBgColor}, ${alert.bgColor})`,
                      borderRadius: 12,
                      padding: "12px",
                      border: `2px solid ${alert.color}30`,
                      position: "relative",
                      overflow: "hidden"
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Цветная полоска слева */}
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: alert.color,
                      borderRadius: "12px 0 0 12px"
                    }} />

                    <div style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10
                    }}>
                      <span style={{ 
                        fontSize: 24,
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        {alert.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: alert.color,
                          fontFamily: "Montserrat, Arial, sans-serif",
                          marginBottom: 4
                        }}>
                          {alert.title}
                        </div>
                        <div style={{
                          fontSize: 14,
                          color: "#374151",
                          fontFamily: "Montserrat, Arial, sans-serif",
                          lineHeight: 1.4,
                          marginBottom: 8
                        }}>
                          {alert.message}
                        </div>
                        
                        {/* Рекомендации */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4
                        }}>
                          {alert.actions.map((action, actionIndex) => (
                            <div
                              key={actionIndex}
                              style={{
                                fontSize: 14,
                                color: "#6b7280",
                                fontFamily: "Montserrat, Arial, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <span style={{ 
                                width: 4, 
                                height: 4, 
                                borderRadius: "50%", 
                                background: alert.color,
                                flexShrink: 0
                              }} />
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Общая сводка */}
              <motion.div
                style={{
                  background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  marginTop: 12,
                  border: `1px solid ${theme.mainColor}20`,
                  position: "relative",
                  overflow: "hidden"
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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
                  fontSize: 16,
                  color: "#374151",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 500,
                  textAlign: "center"
                }}>
                  {criticalCount > 0 
                    ? `🚨 ${criticalCount} критичных предупреждения` 
                    : warningCount > 0 
                    ? `⚠️ ${warningCount} предупреждений`
                    : `ℹ️ ${alerts.length} уведомлений о погоде`
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