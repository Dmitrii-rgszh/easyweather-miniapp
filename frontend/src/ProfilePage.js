import React from 'react';
import { motion } from 'framer-motion';

const ProfilePage = ({ userProfile, onStartSurvey, onClose }) => {
  
  // Функция для красивого отображения выбранных опций
  const formatProfileData = (profile) => {
    if (!profile) return null;

    const healthLabels = {
      meteosensitive: 'Метеозависимость',
      pressure: 'Проблемы с давлением',
      asthma: 'Астма',
      allergies: 'Аллергии',
      healthy: 'Отличное здоровье'
    };

    const activityLabels = {
      outdoor_sports: 'Спорт на улице',
      fitness: 'Прогулки/фитнес',
      homebody: 'Домосед',
      with_children: 'С детьми'
    };

    const interestLabels = {
      gardening: 'Садоводство',
      travel: 'Путешествия',
      photography: 'Фотография',
      work_only: 'Только работа'
    };

    const getAgeDisplay = (profile) => {
      // ✅ ПРИОРИТЕТ: Если есть ageGroup - показываем ДИАПАЗОН
      if (profile.ageGroup) {
        const ageLabels = {
          'young': 'До 18 лет',
          'adult': '18-35 лет', 
          'middle': '35-55 лет',
          'senior': '55+ лет'
        };
        return ageLabels[profile.ageGroup] || 'Не указан';
      }

      // Если возраст число (показываем как диапазон)
      if (typeof profile.age === 'number') {
        const age = profile.age;
        if (age < 18) return 'До 18 лет';
        if (age <= 35) return '18-35 лет';
        if (age <= 55) return '35-55 лет';
        return '55+ лет';
      }

      // Старый формат (для совместимости)
      const ageLabels = {
        under_18: 'До 18 лет',
        '18_35': '18-35 лет',
        '35_55': '35-55 лет',
        '55_plus': '55+ лет',
        'young': 'До 18 лет',
        'adult': '18-35 лет',
        'middle': '35-55 лет', 
        'senior': '55+ лет'
      };
      return ageLabels[profile.age] || 'Не указан';
    };

    return {
      health: profile.health?.map(h => healthLabels[h]).filter(Boolean) || [],
      activity: profile.activity?.map(a => activityLabels[a]).filter(Boolean) || [],
      interests: profile.interests?.map(i => interestLabels[i]).filter(Boolean) || [],
      age: getAgeDisplay(profile), // ✅ Используем новую функцию
      bloodPressure: profile.bloodPressure || null
    };
  };

  const profileData = formatProfileData(userProfile);
  const isCompleted = userProfile?.setupCompleted || false;
  const setupDate = userProfile?.setupDate || null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 2500,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          position: 'relative'
        }}
      >
        {/* Заголовок */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '24px 24px 0 0',
          color: 'white',
          position: 'relative'
        }}>
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>

          <div style={{ textAlign: 'center' }}>
            {/* Аватар пользователя */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
            }}>
              👤
            </div>

            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'Montserrat, Arial, sans-serif',
              marginBottom: '8px'
            }}>
              Ваш профиль
            </h2>

            {/* Статус опроса */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: isCompleted 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              <span style={{ fontSize: '16px' }}>
                {isCompleted ? '✅' : '❌'}
              </span>
              {isCompleted ? 'Персонализация настроена' : 'Опрос не пройден'}
            </div>
          </div>
        </div>

        {/* Контент */}
        <div style={{ padding: '24px' }}>
          {isCompleted && profileData ? (
            <>
              {/* Дата настройки */}
              {setupDate && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '24px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Настроено: {new Date(setupDate).toLocaleDateString('ru-RU')}
                </div>
              )}

              {/* Сводка профиля */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  marginBottom: '16px'
                }}>
                  📊 Ваши особенности
                </h3>

                {/* Здоровье */}
                {profileData.health.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      🩺 Здоровье:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profileData.health.map((item, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Montserrat, Arial, sans-serif'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    
                    {/* Давление */}
                    {profileData.bloodPressure?.type !== 'normal' && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#6b7280',
                        fontFamily: 'Montserrat, Arial, sans-serif'
                      }}>
                        💓 Давление: {profileData.bloodPressure.systolic}/{profileData.bloodPressure.diastolic} 
                        ({profileData.bloodPressure.type === 'high' ? 'повышенное' : 'пониженное'})
                      </div>
                    )}
                  </div>
                )}

                {/* Активность */}
                {profileData.activity.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      🏃 Активность:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profileData.activity.map((item, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#f0f9ff',
                            color: '#0891b2',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Montserrat, Arial, sans-serif'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Интересы */}
                {profileData.interests.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      🌱 Интересы:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profileData.interests.map((item, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#f0fdf4',
                            color: '#059669',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Montserrat, Arial, sans-serif'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Возраст */}
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  👨 Возраст: <strong>{profileData.age}</strong>
                </div>
              </div>
            </>
          ) : (
            /* Сообщение если опрос не пройден */
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#f9fafb',
              borderRadius: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                🤔
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                Профиль не настроен
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.5,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                Пройдите короткий опрос, чтобы получать персональные рекомендации по погоде и здоровью
              </p>
            </div>
          )}

          {/* Кнопка действия */}
          <motion.button
            onClick={onStartSurvey}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '16px',
              background: isCompleted 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Montserrat, Arial, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {isCompleted ? '🔄' : '🚀'}
            </span>
            {isCompleted ? 'Пройти опрос заново' : 'Пройти опрос'}
          </motion.button>

          {/* Дополнительная информация */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            {isCompleted 
              ? 'Вы можете изменить свои предпочтения в любое время'
              : 'Займет всего 2 минуты • Никакой рекламы • Данные хранятся локально'
            }
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;