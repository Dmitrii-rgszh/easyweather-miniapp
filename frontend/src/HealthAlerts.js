// HealthAlerts.js с унифицированной шириной блоков

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Функция анализа здоровья 
function analyzeHealthRisks(weather, userProfile, spaceWeatherData) {
  const alerts = [];
  
  if (!weather || !userProfile) return alerts;
  
  const { temp, pressure, humidity, wind_speed: windSpeed, weather: weatherDesc } = weather;
  const conditions = userProfile.medicalConditions || [];
  const age = userProfile.age;
  
  // Анализ атмосферного давления
  if (pressure && (pressure < 1000 || pressure > 1025)) {
    if (conditions.includes('hypertension') || conditions.includes('cardiovascular') || age >= 60) {
      alerts.push({
        id: 'pressure',
        type: pressure < 1000 ? 'critical' : 'warning',
        icon: pressure < 1000 ? '📉' : '📈',
        title: pressure < 1000 ? 'Низкое давление' : 'Высокое давление',
        description: `Атмосферное давление ${Math.round(pressure)} мм рт.ст.`,
        details: pressure < 1000 
          ? 'Может вызывать головные боли, слабость и ухудшение самочувствия у людей с гипотонией'
          : 'Может способствовать повышению артериального давления у гипертоников',
        recommendation: pressure < 1000
          ? 'Больше отдыхайте, пейте воду, избегайте резких движений'
          : 'Ограничьте физические нагрузки, контролируйте давление',
        color: pressure < 1000 ? '#ef4444' : '#f59e0b',
        bgColor: pressure < 1000 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
      });
    }
  }

  // Анализ температуры и возраста
  if (temp !== undefined) {
    if ((temp < -15 || temp > 30) && (age <= 5 || age >= 65)) {
      alerts.push({
        id: 'temperature',
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
        id: 'humidity',
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
      id: 'wind',
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

  // Анализ магнитных бурь
  if (spaceWeatherData && spaceWeatherData.length > 0) {
    const currentStorm = spaceWeatherData.find(item => {
      const stormDate = new Date(item.message_issue_time);
      const today = new Date();
      return stormDate.toDateString() === today.toDateString();
    });

    if (currentStorm && (conditions.includes('cardiovascular') || conditions.includes('hypertension'))) {
      alerts.push({
        id: 'magnetic',
        type: 'warning',
        icon: '🌌',
        title: 'Магнитная буря',
        description: 'Геомагнитная активность повышена',
        details: 'Магнитные бури могут влиять на сердечно-сосудистую систему и артериальное давление',
        recommendation: 'Контролируйте давление, избегайте стрессов, больше отдыхайте',
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)'
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
    if (!weather || !userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const alerts = analyzeHealthRisks(weather, userProfile, spaceWeatherData);
      setHealthAlerts(alerts);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Ошибка анализа здоровья:', err);
      setError('Ошибка анализа данных о здоровье');
    } finally {
      setLoading(false);
    }
  }, [weather, userProfile, spaceWeatherData]);

  // Если нет профиля пользователя
  if (!userProfile) {
    return null;
  }

  // Если нет медицинских состояний в профиле
  if (!userProfile.medicalConditions || userProfile.medicalConditions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 16,
          padding: 16,
          margin: "16px auto 0", // ← ИСПРАВЛЕНО: теперь как у других блоков
          maxWidth: 340, // ← ИСПРАВЛЕНО: убрали кавычки
          width: "100%",
          boxSizing: "border-box", // ← ДОБАВЛЕНО
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
          padding: 16,
          margin: "16px auto 0", // ← ИСПРАВЛЕНО: теперь как у других блоков
          maxWidth: 340, // ← ИСПРАВЛЕНО: убрали кавычки
          width: "100%",
          boxSizing: "border-box", // ← ДОБАВЛЕНО
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
          fontSize: 12,
          color: '#64748b',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          Метеоусловия не представляют рисков для вашего состояния
        </div>
        {error && (
          <div style={{
            fontSize: 10,
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
        margin: "16px auto 0", // ← ИСПРАВЛЕНО: теперь как у других блоков
        maxWidth: 340, // ← ИСПРАВЛЕНО: убрали кавычки
        width: "100%",
        boxSizing: "border-box" // ← ДОБАВЛЕНО
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
            fontSize: 18,
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
            fontSize: 10,
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
            fontSize: 12,
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
                padding: 16,
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
                gap: 12,
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
                    fontSize: 13,
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
                          fontSize: 12,
                          color: '#4b5563',
                          marginBottom: 6,
                          fontFamily: 'Montserrat, Arial, sans-serif'
                        }}>
                          {alert.details}
                        </div>
                        
                        <div style={{
                          fontSize: 12,
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