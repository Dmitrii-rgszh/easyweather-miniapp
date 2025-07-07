// HealthAlerts.js - Медицинские алерты на основе профиля пользователя

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция анализа медицинских рисков
function analyzeHealthRisks(weather, userProfile, forecastData = []) {
  if (!weather || !userProfile) return [];
  
  const alerts = [];
  const { pressure, humidity, temp } = weather.details;
  const health = userProfile.health || [];
  
  // 🩺 ГИПЕРТОНИКИ - высокое давление (исправленный порог)
  if (health.includes('pressure') && pressure >= 758) { // Изменено с >760 на >=758
    alerts.push({
      id: 'high_pressure_hypertension',
      type: 'warning',
      icon: '🩺',
      title: 'Повышенное давление',
      message: `Атмосферное давление ${pressure} мм рт.ст. может влиять на ваше самочувствие`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 1,
      advice: [
        'Следите за артериальным давлением',
        'Избегайте физических нагрузок',
        'Пейте больше воды',
        'При плохом самочувствии - к врачу'
      ]
    });
  }
  
  // 💊 ГИПОТОНИКИ - низкое давление (исправленный порог)
  if (health.includes('pressure') && pressure <= 742) { // Изменено с <740 на <=742
    alerts.push({
      id: 'low_pressure_hypotension',
      type: 'info',
      icon: '💊',
      title: 'Пониженное давление',
      message: `Пониженное давление ${pressure} мм рт.ст. может вызвать слабость`,
      color: '#8b5cf6',
      bgColor: '#8b5cf615',
      priority: 2,
      advice: [
        'Больше отдыха и сна',
        'Контрастный душ поможет',
        'Кофе или крепкий чай',
        'Избегайте резких движений'
      ]
    });
  }
  
  // 🤕 МЕТЕОЗАВИСИМЫЕ - перепады давления
  if (health.includes('meteosensitive')) {
    // Анализируем перепады давления в прогнозе
    const pressureChanges = analyzePressureChanges(forecastData);
    if (pressureChanges.maxChange > 10) {
      alerts.push({
        id: 'pressure_changes_migraine',
        type: 'warning',
        icon: '🤕',
        title: 'Перепады давления',
        message: `Ожидается перепад до ${pressureChanges.maxChange.toFixed(1)} мм рт.ст.`,
        color: '#ef4444',
        bgColor: '#ef444415',
        priority: 1,
        advice: [
          'Приготовьте обезболивающие',
          'Избегайте стрессов',
          'Больше отдыхайте',
          'Проветривайте помещение'
        ]
      });
    }
  }
  
  // 🫁 АСТМАТИКИ - неблагоприятные условия
  if (health.includes('asthma')) {
    const tempChanges = analyzeTempChanges(forecastData);
    if (humidity > 80 || tempChanges.maxChange > 8) {
      alerts.push({
        id: 'asthma_conditions',
        type: 'warning',
        icon: '🫁',
        title: 'Риск для дыхания',
        message: humidity > 80 
          ? `Высокая влажность ${humidity}% может затруднить дыхание`
          : `Перепады температуры до ${tempChanges.maxChange.toFixed(1)}°C`,
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 2,
        advice: [
          'Имейте ингалятор при себе',
          'Избегайте физнагрузок на улице',
          'Оставайтесь в помещении',
          'Используйте увлажнитель воздуха'
        ]
      });
    }
  }
  
  // 🦴 СУСТАВЫ - влажная и холодная погода
  if (health.includes('joints') || userProfile.age === '55+') {
    if (humidity > 75 && temp < 10) {
      alerts.push({
        id: 'joints_weather',
        type: 'info',
        icon: '🦴',
        title: 'Суставы в зоне риска',
        message: 'Влажная и прохладная погода может усилить боли в суставах',
        color: '#7c3aed',
        bgColor: '#7c3aed15',
        priority: 3,
        advice: [
          'Согревающие мази и кремы',
          'Теплая одежда обязательна',
          'Легкая разминка дома',
          'Горячий чай или ванна'
        ]
      });
    }
  }
  
  return alerts.sort((a, b) => a.priority - b.priority);
}

// Анализ перепадов давления в прогнозе
function analyzePressureChanges(forecastData) {
  if (!forecastData || forecastData.length < 2) {
    return { maxChange: 0, direction: 'stable' };
  }
  
  const pressures = forecastData.slice(0, 8).map(item => 
    Math.round(item.main.pressure * 0.750062)
  );
  
  let maxChange = 0;
  let direction = 'stable';
  
  for (let i = 1; i < pressures.length; i++) {
    const change = Math.abs(pressures[i] - pressures[i-1]);
    if (change > maxChange) {
      maxChange = change;
      direction = pressures[i] > pressures[i-1] ? 'rising' : 'falling';
    }
  }
  
  return { maxChange, direction };
}

// Анализ перепадов температуры
function analyzeTempChanges(forecastData) {
  if (!forecastData || forecastData.length < 2) {
    return { maxChange: 0 };
  }
  
  const temps = forecastData.slice(0, 8).map(item => 
    Math.round(item.main.temp)
  );
  
  let maxChange = 0;
  
  for (let i = 1; i < temps.length; i++) {
    const change = Math.abs(temps[i] - temps[i-1]);
    if (change > maxChange) {
      maxChange = change;
    }
  }
  
  return { maxChange };
}

// Функция получения цветовой темы
function getHealthTheme(alerts) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (criticalAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#06b6d4',
      bgColor: '#06b6d415',
      iconBgColor: '#06b6d410'
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

export default function HealthAlerts({ weather, userProfile, forecastData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzeHealthRisks(weather, userProfile, forecastData);
  const theme = getHealthTheme(alerts);
  
  // Если нет алертов или профиля, не показываем блок
  if (!userProfile || alerts.length === 0) {
    return null;
  }

  // Главный алерт для превью
  const mainAlert = alerts[0];
  const warningCount = alerts.filter(alert => alert.type === 'warning').length;

  return (
    <motion.div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: "10px", // Уменьшили с 16px до 10px как у других блоков
        margin: "16px auto 0",
        maxWidth: 340,
        width: "100%",
        boxSizing: "border-box",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        cursor: "pointer",
        border: warningCount > 0 ? `2px solid ${theme.mainColor}40` : "1px solid rgba(255,255,255,0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
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
          {/* Иконка с анимацией для предупреждений */}
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
              fontSize: 18 // Уменьшили размер иконки с 20 до 18
            }}
            animate={warningCount > 0 ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                `0 0 0 0 ${theme.mainColor}40`,
                `0 0 0 8px ${theme.mainColor}20`,
                `0 0 0 0 ${theme.mainColor}40`
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {mainAlert.icon}
          </motion.div>
          
          {/* Текст */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "Montserrat, Arial, sans-serif",
              marginBottom: 2
            }}>
              🩺 Здоровье {warningCount > 0 && <span style={{ color: theme.mainColor }}>⚠️</span>}
            </div>
            <div style={{
              fontSize: 13, // Уменьшили с 14 до 13
              color: "#6b7280",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              {alerts.length === 1 
                ? mainAlert.title
                : `${alerts.length} рекомендации для здоровья`}
            </div>
          </div>
        </div>
        
        {/* Стрелка */}
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
            <div style={{ paddingTop: 16 }}>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: alert.bgColor,
                    borderRadius: 12,
                    padding: "12px",
                    marginBottom: index < alerts.length - 1 ? 12 : 0,
                    border: `1px solid ${alert.color}20`
                  }}
                >
                  {/* Заголовок алерта */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: 20 }}>{alert.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: alert.color,
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {alert.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Описание */}
                  <div style={{
                    fontSize: 14,
                    color: "#374151",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    marginBottom: 10,
                    lineHeight: 1.4
                  }}>
                    {alert.message}
                  </div>
                  
                  {/* Советы */}
                  <div style={{
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: 8,
                    padding: "8px 10px"
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b7280",
                      marginBottom: 6,
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      💡 Рекомендации:
                    </div>
                    {alert.advice.map((tip, tipIndex) => (
                      <div key={tipIndex} style={{
                        fontSize: 12,
                        color: "#374151",
                        fontFamily: "Montserrat, Arial, sans-serif",
                        marginBottom: tipIndex < alert.advice.length - 1 ? 2 : 0
                      }}>
                        • {tip}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}