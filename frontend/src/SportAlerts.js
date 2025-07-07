// SportAlerts.js - Умные спортивные рекомендации на основе профиля

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция анализа спортивных условий
function analyzeSportConditions(weather, userProfile, forecastData = [], uvData = null) {
  if (!weather || !userProfile) return [];
  
  const alerts = [];
  
  // 🔧 ИСПРАВЛЕННАЯ СТРУКТУРА ДАННЫХ
  const temp = weather.temp; // Температура напрямую из weather.temp
  const humidity = weather.details?.humidity || 0;
  const windSpeed = parseFloat(weather.details?.wind?.replace(' м/с', '') || '0');
  const desc = weather.desc?.toLowerCase() || '';
  const activity = userProfile.activity || [];
  
  console.log('🔍 SportAlerts DEBUG:', { temp, humidity, windSpeed, desc, activity }); // Для отладки
  
  // 🏃 БЕГ/ВЕЛОСИПЕД
  if (activity.includes('running')) {
    const runningScore = calculateRunningScore(temp, humidity, windSpeed, desc);
    
    if (runningScore >= 80) {
      alerts.push({
        id: 'perfect_running',
        type: 'excellent',
        icon: '🏃',
        title: 'Идеально для бега!',
        message: `${temp}°C, влажность ${humidity}% - отличные условия для пробежки`,
        color: '#10b981',
        bgColor: '#10b98115',
        priority: 1,
        score: runningScore,
        advice: [
          'Берите с собой воду',
          'Легкая спортивная одежда',
          'Не забудьте разминку',
          'Наслаждайтесь пробежкой!'
        ]
      });
    } else if (runningScore >= 60) {
      alerts.push({
        id: 'good_running',
        type: 'good',
        icon: '🏃',
        title: 'Хорошо для бега',
        message: `Неплохие условия для пробежки (оценка ${runningScore}/100)`,
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        priority: 2,
        score: runningScore,
        advice: [
          'Подберите подходящую одежду',
          temp > 20 ? 'Больше воды' : 'Разогревайтесь дольше',
          windSpeed > 10 ? 'Защита от ветра' : 'Следите за дыханием'
        ]
      });
    } else if (runningScore < 40) {
      alerts.push({
        id: 'bad_running',
        type: 'warning',
        icon: '🏃',
        title: 'Не лучшее время для бега',
        message: getRunningWarning(temp, humidity, windSpeed, desc),
        color: '#ef4444',
        bgColor: '#ef444415',
        priority: 3,
        score: runningScore,
        advice: [
          'Рассмотрите домашнюю тренировку',
          'Проверьте прогноз на завтра',
          'Может быть, йога или растяжка?'
        ]
      });
    }
  }
  
  // 💪 ФИТНЕС/ПРОГУЛКИ
  if (activity.includes('fitness')) {
    const fitnessScore = calculateFitnessScore(temp, humidity, windSpeed, desc);
    
    if (fitnessScore >= 75) {
      alerts.push({
        id: 'perfect_fitness',
        type: 'excellent',
        icon: '💪',
        title: 'Отлично для прогулок!',
        message: `Прекрасная погода для активности на свежем воздухе`,
        color: '#10b981',
        bgColor: '#10b98115',
        priority: 1,
        score: fitnessScore,
        advice: [
          'Прогулка в парке',
          'Йога на открытом воздухе',
          'Легкие упражнения',
          'Дышите полной грудью!'
        ]
      });
    }
  }
  
  // 👶 С ДЕТЬМИ (с учетом UV)
  if (activity.includes('children')) {
    const childrenScore = calculateChildrenScore(temp, humidity, windSpeed, desc, uvData);
    
    if (childrenScore >= 80) {
      alerts.push({
        id: 'perfect_children',
        type: 'excellent',
        icon: '👶',
        title: 'Идеально для детей!',
        message: `${temp}°C - комфортная температура для прогулки с малышами`,
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 1,
        score: childrenScore,
        advice: [
          'Детская площадка зовет!',
          'Не забудьте панамку',
          'Возьмите воду и перекус',
          uvData && uvData.value >= 3 ? 'Солнцезащитный крем обязательно!' : 'Солнцезащитный крем'
        ]
      });
    } else if (childrenScore >= 60) {
      // Новый промежуточный уровень для UV предупреждений
      const uvWarning = uvData && uvData.value >= 6;
      alerts.push({
        id: 'good_children_uv',
        type: 'warning',
        icon: '👶',
        title: uvWarning ? 'Осторожно с детьми - высокий UV!' : 'Хорошо для детей',
        message: uvWarning 
          ? `${temp}°C подходит, но UV индекс ${uvData.value} - опасно для детской кожи`
          : `${temp}°C - неплохие условия для прогулки`,
        color: uvWarning ? '#f59e0b' : '#06b6d4',
        bgColor: uvWarning ? '#f59e0b15' : '#06b6d415',
        priority: uvWarning ? 1 : 2,
        score: childrenScore,
        advice: [
          uvWarning ? 'Ограничьте время на солнце до 30 минут' : 'Контролируйте время прогулки',
          'SPF 50+ крем обязательно!',
          'Панамка и светлая одежда',
          uvWarning ? 'Избегайте 11:00-16:00' : 'Возьмите воду',
          'Ищите тенистые места'
        ]
      });
    } else if (childrenScore < 50) {
      alerts.push({
        id: 'bad_children',
        type: 'warning',
        icon: '👶',
        title: 'Осторожно с детьми',
        message: getChildrenWarning(temp, humidity, windSpeed, desc, uvData),
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        priority: 2,
        score: childrenScore,
        advice: [
          'Сократите время прогулки',
          'Одевайте потеплее',
          'Избегайте сильного ветра',
          'Лучше поиграть дома'
        ]
      });
    }
  }
  
  // 🔮 АНАЛИЗ БЛИЖАЙШИХ ЧАСОВ (лучшее время)
  const bestTime = findBestSportTime(forecastData, activity);
  if (bestTime) {
    alerts.push(bestTime);
  }
  
  return alerts.sort((a, b) => a.priority - b.priority);
}

// Расчет оценки для бега
function calculateRunningScore(temp, humidity, windSpeed, desc) {
  let score = 100;
  
  // Идеальная температура 10-18°C
  if (temp < 5) score -= 30;
  else if (temp < 10) score -= 15;
  else if (temp > 25) score -= 20;
  else if (temp > 30) score -= 40;
  
  // Влажность
  if (humidity > 80) score -= 25;
  else if (humidity > 70) score -= 15;
  
  // Ветер
  if (windSpeed > 20) score -= 30;
  else if (windSpeed > 15) score -= 15;
  
  // Осадки
  if (desc.includes('дождь')) score -= 40;
  if (desc.includes('снег')) score -= 35;
  if (desc.includes('туман')) score -= 20;
  
  return Math.max(0, score);
}

// Расчет оценки для фитнеса/прогулок
function calculateFitnessScore(temp, humidity, windSpeed, desc) {
  let score = 100;
  
  // Более широкий диапазон температур
  if (temp < 0) score -= 25;
  else if (temp > 30) score -= 20;
  
  // Менее критично к влажности
  if (humidity > 85) score -= 20;
  
  // Ветер
  if (windSpeed > 25) score -= 25;
  
  // Осадки
  if (desc.includes('дождь')) score -= 35;
  if (desc.includes('снег')) score -= 20;
  
  return Math.max(0, score);
}

// Расчет оценки для детей (с учетом UV)
function calculateChildrenScore(temp, humidity, windSpeed, desc, uvData) {
  let score = 100;
  
  // Дети более чувствительны к температуре
  if (temp < 10) score -= 35;
  else if (temp < 15) score -= 20;
  else if (temp > 25) score -= 25;
  else if (temp > 30) score -= 40;
  
  // Ветер опаснее для детей
  if (windSpeed > 15) score -= 30;
  else if (windSpeed > 10) score -= 15;
  
  // Любые осадки плохо
  if (desc.includes('дождь')) score -= 50;
  if (desc.includes('снег')) score -= 30;
  
  // 🆕 UV ИНДЕКС - критично для детей!
  if (uvData && uvData.value) {
    if (uvData.value >= 8) score -= 50; // Очень высокий UV
    else if (uvData.value >= 6) score -= 30; // Высокий UV  
    else if (uvData.value >= 4) score -= 15; // Умеренный UV
    // UV 0-3 безопасен для детей
  }
  
  return Math.max(0, score);
}

// Предупреждения для бега
function getRunningWarning(temp, humidity, windSpeed, desc) {
  if (desc.includes('дождь')) return 'Дождь не подходит для пробежки';
  if (temp < 5) return 'Слишком холодно для комфортного бега';
  if (temp > 30) return 'Слишком жарко - риск перегрева';
  if (windSpeed > 20) return 'Сильный ветер затруднит пробежку';
  if (humidity > 80) return 'Высокая влажность - будет тяжело дышать';
  return 'Неидеальные условия для бега';
}

// Предупреждения для детей (с учетом UV)
function getChildrenWarning(temp, humidity, windSpeed, desc, uvData) {
  if (uvData && uvData.value >= 8) return `Очень высокий UV ${uvData.value} - опасно для детей!`;
  if (uvData && uvData.value >= 6) return `Высокий UV ${uvData.value} - ограничьте время на солнце`;
  if (desc.includes('дождь')) return 'Дождь - лучше остаться дома';
  if (temp < 10) return 'Слишком холодно для малышей';
  if (temp > 28) return 'Жарко - риск перегрева у детей';
  if (windSpeed > 15) return 'Сильный ветер может простудить';
  return 'Не лучшие условия для прогулки с детьми';
}

// Поиск лучшего времени в прогнозе
function findBestSportTime(forecastData, activity) {
  if (!forecastData || forecastData.length < 4) return null;
  
  const now = new Date();
  const next12Hours = forecastData.slice(1, 5); // Следующие 4 периода (12 часов)
  let bestPeriod = null;
  let bestScore = 0;
  
  next12Hours.forEach((item, index) => {
    const temp = Math.round(item.main.temp);
    const humidity = item.main.humidity;
    const windSpeed = item.wind?.speed || 0;
    const desc = item.weather[0].description.toLowerCase();
    const itemTime = new Date(item.dt * 1000);
    
    let score = 0;
    if (activity.includes('running')) {
      score = Math.max(score, calculateRunningScore(temp, humidity, windSpeed, desc));
    }
    if (activity.includes('fitness')) {
      score = Math.max(score, calculateFitnessScore(temp, humidity, windSpeed, desc));
    }
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      
      // Рассчитываем реальную разность во времени
      const timeDiffMs = itemTime - now;
      const hoursDiff = Math.round(timeDiffMs / (1000 * 60 * 60));
      
      bestPeriod = {
        index: index + 1,
        temp,
        humidity,
        windSpeed,
        time: itemTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        hoursDiff: hoursDiff,
        itemTime: itemTime
      };
    }
  });
  
  if (bestPeriod) {
    // Формируем правильное сообщение
    let timeMessage;
    if (bestPeriod.hoursDiff <= 1) {
      timeMessage = `в ${bestPeriod.time}`;
    } else {
      timeMessage = `через ${bestPeriod.hoursDiff}ч в ${bestPeriod.time}`;
    }
    
    return {
      id: 'best_time_prediction',
      type: 'prediction',
      icon: '⏰',
      title: `Лучшее время ${timeMessage}`,
      message: `Будет ${bestPeriod.temp}°C - отлично для спорта!`,
      color: '#8b5cf6',
      bgColor: '#8b5cf615',
      priority: 4,
      score: bestScore,
      advice: [
        'Запланируйте тренировку',
        'Подготовьте экипировку',
        'Напоминание в календаре?'
      ]
    };
  }
  
  return null;
}

// Функция получения цветовой темы
function getSportTheme(alerts) {
  const excellentAlerts = alerts.filter(alert => alert.type === 'excellent').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (excellentAlerts > 0) {
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

export default function SportAlerts({ weather, userProfile, forecastData, uvData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzeSportConditions(weather, userProfile, forecastData, uvData);
  const theme = getSportTheme(alerts);
  
  // Если нет алертов или профиля, не показываем блок
  if (!userProfile || alerts.length === 0) {
    return null;
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
        border: excellentCount > 0 ? `2px solid ${theme.mainColor}40` : "1px solid rgba(255,255,255,0.2)"
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
        {/* Левая часть */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1
        }}>
          {/* Иконка с анимацией для отличных условий */}
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
              🏃 Спорт {excellentCount > 0 && <span style={{ color: theme.mainColor }}>🎯</span>}
            </div>
            <div style={{
              fontSize: 13,
              color: "#6b7280",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}>
              {alerts.length === 1 
                ? mainAlert.title
                : `${alerts.length} спортивные рекомендации`}
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
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: alert.color,
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {alert.title}
                      </div>
                      {alert.score && (
                        <div style={{
                          fontSize: 11,
                          color: "#6b7280",
                          fontFamily: "Montserrat, Arial, sans-serif"
                        }}>
                          Оценка: {alert.score}/100
                        </div>
                      )}
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
                      💡 Советы:
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