import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfileModal = ({ isVisible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    health: [],
    bloodPressure: { systolic: 120, diastolic: 80, type: '' },
    activity: '',
    interests: [],
    age: ''
  });
  const [showPressureDetail, setShowPressureDetail] = useState(false);

  // Обновление профиля
  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  // Переключение множественного выбора
  const toggleMultiSelect = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  // Сохранение и закрытие
  const handleComplete = () => {
    const finalProfile = {
      ...profile,
      setupCompleted: true,
      setupDate: new Date().toISOString().split('T')[0]
    };
    
    try {
      localStorage.setItem('userProfile', JSON.stringify(finalProfile));
      onComplete(finalProfile);
    } catch (error) {
      console.error('Не удалось сохранить профиль:', error);
    }
  };

  // Переход к следующему шагу
  const nextStep = () => {
    if (currentStep === 1 && profile.health.includes('pressure') && !showPressureDetail) {
      setShowPressureDetail(true);
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setShowPressureDetail(false);
    }
  };

  // Назад
  const prevStep = () => {
    if (showPressureDetail) {
      setShowPressureDetail(false);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Проверка готовности для перехода
  const canProceed = () => {
    switch (currentStep) {
      case 1: return profile.health.length > 0;
      case 2: return profile.activity !== '';
      case 3: return profile.interests.length > 0;
      case 4: return profile.age !== '';
      default: return false;
    }
  };

  if (!isVisible) return null;

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
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          maxWidth: '450px',
          width: '100%',
          color: 'white',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
          position: 'relative'
        }}
      >
        {/* Заголовок и прогресс */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              Персонализация
            </h2>
            <div style={{
              fontSize: '14px',
              opacity: 0.8,
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              {showPressureDetail ? '1' : currentStep}/4
            </div>
          </div>

          {/* Прогресс-бар */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)',
                borderRadius: '2px'
              }}
              initial={{ width: '25%' }}
              animate={{ 
                width: showPressureDetail ? '25%' : `${(currentStep / 4) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Контент вопросов */}
        <div style={{ 
          padding: '0 24px',
          minHeight: '320px',
          position: 'relative'
        }}>
          <AnimatePresence mode="wait">
            {/* ВОПРОС 1: ЗДОРОВЬЕ */}
            {currentStep === 1 && !showPressureDetail && (
              <motion.div
                key="health"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  🩺 Расскажите о своем здоровье
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Выберите все подходящие варианты
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'meteosensitive', icon: '🩺', label: 'Метеозависимость/мигрени' },
                    { id: 'pressure', icon: '💓', label: 'Проблемы с давлением' },
                    { id: 'asthma', icon: '🫁', label: 'Астма/аллергии' },
                    { id: 'healthy', icon: '💪', label: 'Отличное здоровье' }
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleMultiSelect('health', option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: profile.health.includes(option.id)
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: profile.health.includes(option.id)
                          ? '2px solid #ffd700'
                          : '2px solid transparent'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{option.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                      {profile.health.includes(option.id) && (
                        <span style={{ fontSize: '16px' }}>✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ДЕТАЛИ ДАВЛЕНИЯ */}
            {currentStep === 1 && showPressureDetail && (
              <motion.div
                key="pressure-detail"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  💓 Какое у вас давление?
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Это поможет давать точные предупреждения
                </p>

                {/* Тип давления */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { id: 'high', label: 'Высокое (гипертония)', icon: '📈' },
                      { id: 'low', label: 'Низкое (гипотония)', icon: '📉' },
                      { id: 'normal', label: 'Нормальное', icon: '✅' }
                    ].map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => updateProfile('bloodPressure', { 
                          ...profile.bloodPressure, 
                          type: type.id 
                        })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          border: 'none',
                          borderRadius: '8px',
                          background: profile.bloodPressure.type === type.id
                            ? 'rgba(255, 215, 0, 0.2)'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '12px',
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          cursor: 'pointer',
                          border: profile.bloodPressure.type === type.id
                            ? '2px solid #ffd700'
                            : '2px solid transparent',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                          {type.icon}
                        </div>
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Числовые значения */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      marginBottom: '8px',
                      opacity: 0.8,
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      Верхнее
                    </label>
                    <input
                      type="number"
                      min="90"
                      max="200"
                      value={profile.bloodPressure.systolic}
                      onChange={(e) => updateProfile('bloodPressure', {
                        ...profile.bloodPressure,
                        systolic: parseInt(e.target.value) || 120
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    opacity: 0.6
                  }}>
                    /
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      marginBottom: '8px',
                      opacity: 0.8,
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      Нижнее
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="120"
                      value={profile.bloodPressure.diastolic}
                      onChange={(e) => updateProfile('bloodPressure', {
                        ...profile.bloodPressure,
                        diastolic: parseInt(e.target.value) || 80
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ВОПРОС 2: АКТИВНОСТЬ */}
            {currentStep === 2 && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  🏃 Какая у вас активность?
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Выберите один подходящий вариант
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'outdoor_sports', icon: '🏃', label: 'Спорт на улице (бег, велосипед)' },
                    { id: 'fitness', icon: '🚶', label: 'Прогулки/фитнес' },
                    { id: 'homebody', icon: '🏠', label: 'Домосед' },
                    { id: 'with_children', icon: '👶', label: 'С детьми' }
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => updateProfile('activity', option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: profile.activity === option.id
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: profile.activity === option.id
                          ? '2px solid #ffd700'
                          : '2px solid transparent'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{option.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                      {profile.activity === option.id && (
                        <span style={{ fontSize: '16px' }}>✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ВОПРОС 3: ИНТЕРЕСЫ */}
            {currentStep === 3 && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  🌱 Что вас интересует?
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Выберите все подходящие варианты
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'gardening', icon: '🌱', label: 'Дача/садоводство' },
                    { id: 'travel', icon: '🌍', label: 'Путешествия' },
                    { id: 'photography', icon: '📸', label: 'Фотография природы' },
                    { id: 'work_only', icon: '🏢', label: 'Только рабочие дни' }
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleMultiSelect('interests', option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: profile.interests.includes(option.id)
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: profile.interests.includes(option.id)
                          ? '2px solid #ffd700'
                          : '2px solid transparent'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{option.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                      {profile.interests.includes(option.id) && (
                        <span style={{ fontSize: '16px' }}>✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ВОПРОС 4: ВОЗРАСТ */}
            {currentStep === 4 && (
              <motion.div
                key="age"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  👨 Ваш возраст?
                </h3>
                <p style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Это поможет подобрать подходящие рекомендации
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { id: 'under_18', icon: '👶', label: 'До 18' },
                    { id: '18_35', icon: '👨', label: '18-35' },
                    { id: '35_55', icon: '👩', label: '35-55' },
                    { id: '55_plus', icon: '👴', label: '55+' }
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => updateProfile('age', option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '20px 16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: profile.age === option.id
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: profile.age === option.id
                          ? '2px solid #ffd700'
                          : '2px solid transparent'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{option.icon}</span>
                      <span>{option.label}</span>
                      {profile.age === option.id && (
                        <span style={{ fontSize: '16px' }}>✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Кнопки управления */}
        <div style={{
          padding: '0 24px 24px 24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          {(currentStep > 1 || showPressureDetail) && (
            <motion.button
              onClick={prevStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                cursor: 'pointer'
              }}
            >
              ← Назад
            </motion.button>
          )}

          <motion.button
            onClick={currentStep === 4 ? handleComplete : nextStep}
            disabled={!canProceed() && !showPressureDetail}
            whileHover={canProceed() || showPressureDetail ? { scale: 1.05 } : {}}
            whileTap={canProceed() || showPressureDetail ? { scale: 0.95 } : {}}
            style={{
              flex: 1,
              padding: '16px',
              background: (canProceed() || showPressureDetail)
                ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                : 'rgba(255,255,255,0.1)',
              color: (canProceed() || showPressureDetail) ? '#1a1a1a' : 'rgba(255,255,255,0.5)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Montserrat, Arial, sans-serif',
              cursor: (canProceed() || showPressureDetail) ? 'pointer' : 'not-allowed',
              marginLeft: (currentStep === 1 && !showPressureDetail) ? 0 : 'auto'
            }}
          >
            {currentStep === 4 ? '🎉 Готово!' : 'Далее →'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfileModal;