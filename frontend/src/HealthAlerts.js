// 🏥 HealthAlerts.js - Обновленные медицинские алерты с новой системой анализа

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWeatherForHealth } from './utils/healthAnalysis';

const HealthAlerts = ({ weather, userProfile, forecastData = [] }) => {
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!weather || !userProfile?.health) return;

    const analyzeHealth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🩺 Начинаем анализ здоровья...', { weather, userProfile });
        
        // Получаем алерты с учетом магнитных бурь
        const alerts = await analyzeWeatherForHealth(weather, userProfile, forecastData);
        
        setHealthAlerts(alerts);
        setLastUpdate(new Date());
        
        console.log('✅ Анализ здоровья завершен:', { 
          alertsCount: alerts.length
        });
        
      } catch (error) {
        console.error('❌ Ошибка анализа здоровья:', error);
        setError('Не удалось полностью проанализировать влияние погоды на здоровье');
        
        // Показываем базовые алерты даже при ошибке
        try {
          const basicAlerts = await analyzeWeatherForHealth(weather, userProfile, []);
          setHealthAlerts(basicAlerts);
        } catch (basicError) {
          console.error('❌ Критическая ошибка:', basicError);
          setHealthAlerts([]);
        }
        
      } finally {
        setLoading(false);
      }
    };

    analyzeHealth();
  }, [weather, userProfile, forecastData]);

  // Если пользователь не указал проблемы со здоровьем
  if (!userProfile?.health?.length || (userProfile.health.includes('healthy') && userProfile.health.length === 1)) {
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
          💪 У вас отличное здоровье!
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
      style={{ margin: '10px 0' }}
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
                    repeatType: "reverse"
                  }}
                >
                  {alert.icon}
                </motion.span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Заголовок */}
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: alert.color,
                    marginBottom: 4,
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    lineHeight: 1.2
                  }}>
                    {alert.title}
                  </div>

                  {/* Сообщение */}
                  <div style={{
                    fontSize: 14,
                    color: '#374151',
                    marginBottom: 8,
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    lineHeight: 1.3
                  }}>
                    {alert.message}
                  </div>

                  {/* Индикатор развернутости */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      fontSize: 12,
                      color: '#64748b',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      {showDetails[alert.id] ? 'Скрыть советы' : 'Показать советы'}
                    </div>
                    
                    <motion.div
                      animate={{ rotate: showDetails[alert.id] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 12,
                        color: alert.color,
                        fontWeight: 'bold'
                      }}
                    >
                      ▼
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Развернутые советы */}
              <AnimatePresence>
                {showDetails[alert.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      marginTop: 16,
                      marginLeft: 44, // Выравниваем с текстом
                      paddingTop: 12,
                      borderTop: `1px solid ${alert.color}30`
                    }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: alert.color,
                        marginBottom: 8,
                        fontFamily: 'Montserrat, Arial, sans-serif'
                      }}>
                        💡 Рекомендации:
                      </div>
                      
                      {alert.advice?.map((tip, tipIndex) => (
                        <motion.div
                          key={tipIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: tipIndex * 0.1 }}
                          style={{
                            fontSize: 12,
                            color: '#4b5563',
                            marginBottom: 4,
                            fontFamily: 'Montserrat, Arial, sans-serif',
                            lineHeight: 1.4
                          }}
                        >
                          {tip}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Дисклеймер */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 12,
        border: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        <div style={{
          fontSize: 10,
          color: '#64748b',
          textAlign: 'center',
          fontFamily: 'Montserrat, Arial, sans-serif',
          lineHeight: 1.4
        }}>
          ⚠️ Рекомендации носят информационный характер. 
          При ухудшении самочувствия обратитесь к врачу.
        </div>
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