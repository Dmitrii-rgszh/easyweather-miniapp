// 🏥 HealthAlerts.js - Расширенные медицинские алерты

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWeatherForHealth, getMagneticStormData, analyzeMagneticStorms } from './utils/healthAnalysis';

const HealthAlerts = ({ weather, userProfile, forecastData = [] }) => {
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [magneticAlerts, setMagneticAlerts] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!weather || !userProfile?.healthConditions) return;

    const analyzeHealth = async () => {
      setLoading(true);
      
      try {
        // Анализ погодных условий для здоровья
        const weatherAlerts = analyzeWeatherForHealth(weather, userProfile, forecastData);
        setHealthAlerts(weatherAlerts);

        // Получение данных о магнитных бурях
        if (userProfile.healthConditions.includes('meteoropathy')) {
          const stormData = await getMagneticStormData();
          const stormAlerts = analyzeMagneticStorms(stormData, userProfile);
          setMagneticAlerts(stormAlerts);
        }
      } catch (error) {
        console.error('Ошибка анализа здоровья:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeHealth();
  }, [weather, userProfile, forecastData]);

  const allAlerts = [...healthAlerts, ...magneticAlerts];

  if (!userProfile?.healthConditions?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: 16,
          margin: '10px 0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          textAlign: 'center'
        }}
      >
        <div style={{
          fontSize: 16,
          color: '#64748b',
          fontFamily: 'Montserrat, Arial, sans-serif',
          marginBottom: 8
        }}>
          🏥 Медицинские рекомендации
        </div>
        <div style={{
          fontSize: 12,
          color: '#94a3b8',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          Укажите ваши заболевания в профиле для получения персональных рекомендаций
        </div>
      </motion.div>
    );
  }

  if (allAlerts.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: 16,
          margin: '10px 0',
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
          ✅ Отличные условия для здоровья!
        </div>
        <div style={{
          fontSize: 12,
          color: '#64748b',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          Погодные условия благоприятны для вашего состояния
        </div>
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
      style={{ margin: '10px 0' }}
    >
      {/* Заголовок блока */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 4
      }}>
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

      {/* Список алертов */}
      <AnimatePresence>
        {allAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: `1px solid ${alert.color}20`,
              borderLeft: `4px solid ${alert.color}`
            }}
          >
            {/* Основная информация */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <span style={{ fontSize: 20, marginRight: 8 }}>
                    {alert.icon}
                  </span>
                  <h4 style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: alert.color,
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    {alert.title}
                  </h4>
                </div>
                
                <p style={{
                  margin: '0 0 8px 28px',
                  fontSize: 12,
                  color: '#475569',
                  lineHeight: 1.4,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  {alert.message}
                </p>
              </div>

              {/* Кнопка подробностей */}
              <motion.button
                onClick={() => toggleDetails(alert.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: alert.bgColor,
                  border: `1px solid ${alert.color}30`,
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  color: alert.color,
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}
              >
                {showDetails[alert.id] ? 'Скрыть ▲' : 'Подробнее ▼'}
              </motion.button>
            </div>

            {/* Детальная информация */}
            <AnimatePresence>
              {showDetails[alert.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${alert.color}20`,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: alert.color,
                    marginBottom: 8,
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    💡 Рекомендации:
                  </div>
                  
                  <div style={{ paddingLeft: 12 }}>
                    {alert.advice.map((tip, tipIndex) => (
                      <div
                        key={tipIndex}
                        style={{
                          fontSize: 11,
                          color: '#64748b',
                          marginBottom: 4,
                          lineHeight: 1.4,
                          fontFamily: 'Montserrat, Arial, sans-serif'
                        }}
                      >
                        • {tip}
                      </div>
                    ))}
                  </div>

                  {/* Применимые состояния */}
                  {alert.conditions && alert.conditions.length > 0 && !alert.conditions.includes('all') && (
                    <div style={{
                      marginTop: 8,
                      padding: 8,
                      background: `${alert.color}10`,
                      borderRadius: 6,
                      fontSize: 10,
                      color: '#64748b',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      📋 Актуально при: {alert.conditions.join(', ')}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Disclaimer */}
      <div style={{
        marginTop: 12,
        padding: 12,
        background: 'rgba(249, 250, 251, 0.8)',
        borderRadius: 8,
        fontSize: 10,
        color: '#6b7280',
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        border: '1px solid rgba(229, 231, 235, 0.8)'
      }}>
        ⚠️ Информация носит рекомендательный характер. При ухудшении самочувствия обратитесь к врачу.
      </div>

      {/* CSS для анимации загрузки */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default HealthAlerts;