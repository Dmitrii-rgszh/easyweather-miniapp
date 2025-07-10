// HealthAlerts.js - ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ с унифицированной структурой

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Медицинские пороги для различных состояний
const HEALTH_THRESHOLDS = {
  pressure: {
    very_low: 735,
    low: 745,
    normal_low: 750,
    normal_high: 760,  // ✅ Понижаем верхнюю границу нормы
    high: 765,         // ✅ Теперь 764 попадет в "высокое"
    very_high: 775     // ✅ Корректируем очень высокое
  },
  humidity: {
    low: 30,
    comfortable: 60,
    high: 75,
    very_high: 85
  },
  temperature: {
    very_cold: 0,
    cold: 10,
    cool: 18,
    warm: 25,
    hot: 30,
    very_hot: 35
  },
  wind: {
    calm: 3,
    light: 8,
    moderate: 15,
    strong: 25
  }
};

// ИСПРАВЛЕНО: Унифицированная функция маппинга состояний здоровья
function mapHealthConditions(userProfile) {
  const conditions = [];
  
  // ЗАЩИТА ОТ UNDEFINED - главное исправление!
  if (!userProfile) {
    console.log('⚠️ Профиль пользователя не определен');
    return conditions;
  }

  // Проверяем оба возможных поля для совместимости
  let healthArray = [];
  if (userProfile.health && Array.isArray(userProfile.health)) {
    healthArray = userProfile.health;
  } else if (userProfile.medicalConditions && Array.isArray(userProfile.medicalConditions)) {
    healthArray = userProfile.medicalConditions;
  } else {
    console.log('⚠️ Не найдены данные о здоровье:', userProfile);
    return conditions;
  }

  healthArray.forEach(condition => {
    switch (condition) {
      case 'meteosensitive':
      case 'meteoropathy':
        conditions.push('meteoropathy', 'migraine');
        break;
      case 'pressure':
      case 'hypertension':
      case 'cardiovascular':
        const bpType = userProfile.bloodPressure?.type;
        if (bpType === 'high') conditions.push('hypertension');
        if (bpType === 'low') conditions.push('hypotension');
        if (bpType === 'variable') conditions.push('hypertension', 'hypotension');
        conditions.push('heart_disease');
        break;
      case 'asthma':
        conditions.push('asthma', 'respiratory');
        break;
      case 'allergies':
        conditions.push('allergies', 'respiratory');
        break;
      case 'arthritis':
        conditions.push('arthritis', 'joints');
        break;
    }
  });
  
  return [...new Set(conditions)]; // Убираем дубликаты
}

// Функция анализа рисков для здоровья
async function analyzeHealthRisks(weather, userProfile, spaceWeatherData) {
  console.log('🏥 Начинаем анализ рисков для здоровья...');
  
  if (!weather || !userProfile) {
    console.log('⚠️ Недостаточно данных для анализа');
    return [];
  }
  
  const alerts = [];
  const conditions = mapHealthConditions(userProfile);
  
  if (conditions.length === 0) {
    console.log('ℹ️ Пользователь здоров или не указал проблем со здоровьем');
    return [];
  }
  
  console.log('📋 Анализируемые состояния:', conditions);
  
  // Извлекаем данные о погоде с защитой от undefined
  const temp = weather.temp || weather.temperature || 20;
  const pressure = weather.pressure || weather.details?.pressure || 760;
  const humidity = weather.humidity || weather.details?.humidity || 50;
  const windSpeed = weather.wind_speed || 
                   (weather.details?.wind ? parseFloat(weather.details.wind.replace(' м/с', '')) : 0) || 0;
  const weatherDesc = weather.weather || weather.description || [];

  // Анализ атмосферного давления
  if (pressure && (conditions.includes('hypertension') || conditions.includes('hypotension') || conditions.includes('meteoropathy'))) {
    if (pressure <= HEALTH_THRESHOLDS.pressure.very_low) {
      alerts.push({
        id: 'pressure_very_low',
        type: 'critical',
        icon: '📉',
        title: 'Критически низкое давление',
        description: `${Math.round(pressure)} мм рт.ст. - неблагоприятно для здоровья`,
        details: 'Может вызывать головные боли, слабость и ухудшение самочувствия у людей с гипотонией',
        recommendation: 'Выпейте крепкий кофе или чай, избегайте резких движений',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)'
      });
    } else if (pressure <= HEALTH_THRESHOLDS.pressure.low) {
      alerts.push({
        id: 'pressure_low',
        type: 'warning',
        icon: '📉',
        title: 'Низкое атмосферное давление',
        description: `${Math.round(pressure)} мм рт.ст. - возможна слабость`,
        details: 'Пониженное давление может вызывать усталость и головокружение',
        recommendation: 'Утренний кофе обязателен, пейте больше жидкости',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      });
    } else if (pressure >= HEALTH_THRESHOLDS.pressure.very_high) {
      alerts.push({
        id: 'pressure_very_high',
        type: 'critical',
        icon: '📈',
        title: 'Критически высокое давление',
        description: `${Math.round(pressure)} мм рт.ст. - опасно для гипертоников`,
        details: 'Высокое атмосферное давление может способствовать повышению артериального давления',
        recommendation: 'Примите назначенные препараты, ограничьте физические нагрузки',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)'
      });
    } else if (pressure > HEALTH_THRESHOLDS.pressure.normal_high) {
      alerts.push({
        id: 'pressure_high',
        type: 'warning',
        icon: '📈',
        title: 'Высокое атмосферное давление',
        description: `${Math.round(pressure)} мм рт.ст. - контролируйте АД`,
        details: 'Повышенное давление требует внимания у гипертоников',
        recommendation: 'Контролируйте прием лекарств, избегайте стрессов',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      });
    }
  }

  // Анализ температуры и возраста
  if (temp !== undefined) {
    const age = userProfile.age || 30;
    if ((temp < -15 || temp > 30) && (age <= 5 || age >= 65)) {
      alerts.push({
        id: 'temperature_extreme',
        type: 'warning',
        icon: temp < -15 ? '🥶' : '🥵',
        title: temp < -15 ? 'Экстремальный холод' : 'Экстремальная жара',
        description: `Температура ${Math.round(temp)}°C опасна для вашей возрастной группы`,
        details: temp < -15 
          ? 'Повышенный риск переохлаждения и обморожения' 
          : 'Риск теплового удара и обезвоживания',
        recommendation: temp < -15
          ? 'Сократите время на улице, теплая одежда обязательна'
          : 'Избегайте длительного пребывания на солнце, пейте больше воды',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      });
    }
  }

  // Анализ влажности при астме
  if (humidity !== undefined && conditions.includes('asthma')) {
    if (humidity > 80) {
      alerts.push({
        id: 'humidity_asthma',
        type: 'warning',
        icon: '💨',
        title: 'Высокая влажность',
        description: `Влажность ${humidity}% может ухудшить дыхание`,
        details: 'Высокая влажность способствует размножению плесени и пылевых клещей',
        recommendation: 'Имейте при себе ингалятор, избегайте интенсивных нагрузок',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      });
    }
  }

  // Анализ ветра при мигренях
  if (windSpeed > 7 && conditions.includes('migraine')) {
    alerts.push({
      id: 'wind_migraine',
      type: 'warning',
      icon: '🌪️',
      title: 'Сильный ветер',
      description: `Ветер ${Math.round(windSpeed)} м/с может спровоцировать мигрень`,
      details: 'Резкие изменения атмосферного давления при ветре часто вызывают головные боли',
      recommendation: 'Примите профилактические меры, избегайте открытых пространств',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    });
  }

  // Анализ для метеозависимых - комплексный подход
  if (conditions.includes('meteoropathy') || conditions.includes('migraine')) {
    const triggers = [];
    
    if (humidity >= HEALTH_THRESHOLDS.humidity.very_high) {
      triggers.push('высокая влажность');
    }
    
    if (windSpeed >= HEALTH_THRESHOLDS.wind.strong) {
      triggers.push('сильный ветер');
    }
    
    if (temp >= HEALTH_THRESHOLDS.temperature.very_hot) {
      triggers.push('сильная жара');
    }
    
    if (Array.isArray(weatherDesc) && weatherDesc.length > 0 && 
        weatherDesc.some(desc => desc.main && desc.main.includes('Rain'))) {
      triggers.push('дождь');
    }
    
    if (triggers.length >= 2) {
      alerts.push({
        id: 'meteoropathy_high_risk',
        type: 'warning',
        icon: '🤕',
        title: 'Высокий риск для метеозависимых',
        description: `Несколько неблагоприятных факторов: ${triggers.join(', ')}`,
        details: 'Комбинация погодных факторов может значительно ухудшить самочувствие',
        recommendation: 'Подготовьте лекарства заранее, избегайте стрессовых ситуаций',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)'
      });
    } else if (triggers.length === 1) {
      alerts.push({
        id: 'meteoropathy_moderate_risk',
        type: 'info',
        icon: '💡',
        title: 'Возможен дискомфорт',
        description: `Выявлен неблагоприятный фактор: ${triggers[0]}`,
        details: 'Один фактор риска может вызвать легкое недомогание',
        recommendation: 'Имейте при себе лекарства, пейте достаточно воды',
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.1)'
      });
    }
  }

  console.log(`✅ Анализ завершен. Найдено ${alerts.length} рисков для здоровья`);
  
  // 🌌 АНАЛИЗ МАГНИТНЫХ БУРЬ (добавляем в конец функции analyzeHealthRisks)
  if (conditions.includes('meteoropathy') || conditions.includes('migraine')) {
    // Получаем данные о магнитных бурях асинхронно
    try {
      console.log('🌌 Получаем данные о магнитных бурях...');
      
      // Простой fetch к NOAA API
      const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
      if (response.ok) {
        const kpData = await response.json();
        const latest = kpData[kpData.length - 1];
        const currentKp = parseFloat(latest.kp_index) || 2;
        
        console.log(`🌌 Kp-индекс: ${currentKp}`);
        
        if (currentKp >= 5) {
          // Магнитная буря
          alerts.push({
            id: 'magnetic_storm',
            type: 'warning',
            icon: '🌌',
            title: 'Магнитная буря',
            description: `Геомагнитная активность (Kp=${currentKp.toFixed(1)})`,
            details: 'Магнитные бури могут ухудшать самочувствие метеочувствительных людей',
            recommendation: 'Больше отдыхайте, пейте воду, избегайте стрессов',
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)'
          });
        } else if (currentKp >= 3) {
          // Умеренная активность
          alerts.push({
            id: 'magnetic_moderate',
            type: 'info',
            icon: '🌌',
            title: 'Умеренная магнитная активность',
            description: `Геомагнитная активность (Kp=${currentKp.toFixed(1)})`,
            details: 'Возможно легкое недомогание у особо чувствительных людей',
            recommendation: 'Контролируйте самочувствие, пейте достаточно воды',
            color: '#6366f1',
            bgColor: 'rgba(99, 102, 241, 0.1)'
          });
        } else {
          // Спокойная обстановка
          alerts.push({
            id: 'magnetic_calm',
            type: 'info',
            icon: '🌌',
            title: 'Спокойная магнитная обстановка',
            description: `Низкая геомагнитная активность (Kp=${currentKp.toFixed(1)})`,
            details: 'Благоприятные условия для метеочувствительных людей',
            recommendation: 'Отличное время для активности и прогулок',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось получить данные о магнитных бурях:', error);
      // Добавляем fallback алерт
      alerts.push({
        id: 'magnetic_unknown',
        type: 'info',
        icon: '🌌',
        title: 'Мониторинг космической погоды',
        description: 'Данные о магнитной активности временно недоступны',
        details: 'Следите за самочувствием и принимайте обычные меры предосторожности',
        recommendation: 'При ухудшении самочувствия обратитесь к врачу',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.1)'
      });
    }
  }

  return alerts;
}

// Компонент анимированной стрелки
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

export default function HealthAlerts({ weather, userProfile, spaceWeatherData }) {
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!weather || !userProfile) {
      setHealthAlerts([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Асинхронная функция для получения данных о магнитных бурях
    // Простая функция анализа без импорта
    const analyzeWithSpaceWeather = async () => {
      try {
        console.log('🏥 HealthAlerts: Запуск анализа здоровья');
        console.log('📊 Данные погоды:', weather);
        console.log('👤 Профиль пользователя:', userProfile);
  
        // Используем локальную функцию analyzeHealthRisks (которая уже есть в этом файле)
        const alerts = await analyzeHealthRisks(weather, userProfile, spaceWeatherData);
        setHealthAlerts(alerts);
        setLastUpdate(new Date());
  
        console.log('✅ HealthAlerts: Получено алертов:', alerts.length);
      } catch (err) {
        console.error('❌ Ошибка анализа здоровья:', err);
        setError('Ошибка анализа данных о здоровье');
        setHealthAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeWithSpaceWeather();
  }, [weather, userProfile]);

  // Если нет профиля пользователя
  if (!userProfile) {
    return null;
  }

  // Проверяем наличие данных о здоровье в любом из полей
  const hasHealthData = (userProfile.health && Array.isArray(userProfile.health) && userProfile.health.length > 0) ||
                       (userProfile.medicalConditions && Array.isArray(userProfile.medicalConditions) && userProfile.medicalConditions.length > 0);

  // Если нет данных о здоровье
  if (!hasHealthData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 16,
          padding: 10,
          margin: "16px auto 0",
          maxWidth: 340,
          width: "100%",
          boxSizing: "border-box",
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <div style={{
          fontSize: 16,
          color: '#10b981',
          fontFamily: 'Montserrat, Arial, sans-serif',
          marginBottom: 4
        }}>
          ✅ Отличное здоровье!
        </div>
        <div style={{
          fontSize: 12,
          color: '#64748b',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          Наслаждайтесь погодой без ограничений
        </div>
      </motion.div>
    );
  }

  // Если нет алертов и анализ завершен
  if (healthAlerts.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: 12,
          margin: "16px auto 0",
          maxWidth: 340,
          width: "100%",
          boxSizing: "border-box",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          textAlign: 'center'
        }}
      >
        <div style={{
          fontSize: 16,
          color: '#10b981',
          fontFamily: 'Montserrat, Arial, sans-serif',
          marginBottom: 4
        }}>
          ✅ Погода благоприятна для здоровья
        </div>
        <div style={{
          fontSize: 14,
          color: '#64748b',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          Метеоусловия не представляют рисков для вашего состояния
        </div>
        {error && (
          <div style={{
            fontSize: 12,
            color: '#f59e0b',
            marginTop: 8,
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            ⚠️ {error}
          </div>
        )}
      </motion.div>
    );
  }

  const toggleDetails = (alertId) => {
    setShowDetails(prev => ({
      ...prev,
      [alertId]: !prev[alertId]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        margin: "16px auto 0",
        maxWidth: 340,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* Заголовок блока с индикатором обновления */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingLeft: 4
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>🏥</span>
          <h3 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#1e293b',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            Здоровье и метеозависимость
          </h3>
          {loading && (
            <div style={{
              marginLeft: 8,
              width: 16,
              height: 16,
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>
        
        {/* Время последнего обновления */}
        {lastUpdate && (
          <div style={{
            fontSize: 16,
            color: '#94a3b8',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            🕐 {lastUpdate.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>

      {/* Ошибка API */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12
          }}
        >
          <div style={{
            fontSize: 14,
            color: '#f59e0b',
            fontFamily: 'Montserrat, Arial, sans-serif',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        </motion.div>
      )}

      {/* Список алертов */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 12
      }}>
        <AnimatePresence>
          {healthAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{
                background: `linear-gradient(135deg, ${alert.bgColor}, rgba(255,255,255,0.9))`,
                borderRadius: 16,
                padding: 12,
                border: `2px solid ${alert.color}30`,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleDetails(alert.id)}
            >
              {/* Цветная полоска */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: alert.color,
                borderRadius: '16px 0 0 16px'
              }} />

              {/* Основная информация */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 4,
                marginLeft: 8
              }}>
                {/* Иконка с анимацией */}
                <motion.span 
                  style={{ 
                    fontSize: 24,
                    display: 'block',
                    lineHeight: 1
                  }}
                  animate={{ 
                    scale: alert.type === 'critical' ? [1, 1.1, 1] : 1,
                    rotate: alert.type === 'warning' ? [0, 2, -2, 0] : 0
                  }}
                  transition={{
                    duration: alert.type === 'critical' ? 1 : 2,
                    repeat: alert.type === 'critical' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {alert.icon}
                </motion.span>

                {/* Текстовая информация */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: 2,
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    {alert.title}
                  </div>
                  
                  <div style={{
                    fontSize: 15,
                    color: '#64748b',
                    marginBottom: 8,
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    {alert.description}
                  </div>

                  {/* Детальная информация (раскрывающаяся) */}
                  <AnimatePresence>
                    {showDetails[alert.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          borderTop: '1px solid rgba(107, 114, 128, 0.2)',
                          paddingTop: 8,
                          marginTop: 8
                        }}
                      >
                        <div style={{
                          fontSize: 14,
                          color: '#4b5563',
                          marginBottom: 6,
                          fontFamily: 'Montserrat, Arial, sans-serif'
                        }}>
                          {alert.details}
                        </div>
                        
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: alert.color,
                          fontFamily: 'Montserrat, Arial, sans-serif'
                        }}>
                          💡 {alert.recommendation}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Стрелка раскрытия */}
                <ChevronIcon isOpen={showDetails[alert.id]} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}