// UserProfileModal.js - ИСПРАВЛЕННАЯ ВЕРСИЯ с правильным сбросом состояний

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Компонент NumberPicker с автоматической прокруткой
const NumberPicker = ({ label, value, onChange, min, max }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedItemRef = useRef(null);
  
  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  // Автоматическая прокрутка к выбранному элементу при открытии
  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100); // Небольшая задержка для завершения анимации
    }
  }, [isOpen]);

  const values = [];
  for (let i = min; i <= max; i += 5) {
    values.push(i);
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '8px',
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}>
        {label}
      </div>
      
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600',
          fontFamily: 'Montserrat, Arial, sans-serif',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{value}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '120px', // Уменьшили высоту для лучшего контроля
              overflowY: 'auto',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {values.map((val) => (
              <motion.button
                key={val}
                ref={value === val ? selectedItemRef : null} // Привязываем ref к выбранному элементу
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(val);
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px', // Уменьшили padding для компактности
                  border: 'none',
                  background: value === val ? '#ffd700' : 'transparent',
                  color: value === val ? '#1a1a1a' : '#374151',
                  fontSize: '14px', // Уменьшили размер шрифта
                  fontWeight: value === val ? '600' : '400',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                whileHover={{
                  background: value === val ? '#ffd700' : 'rgba(255, 215, 0, 0.2)'
                }}
              >
                {val}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserProfileModal = ({ isVisible, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    health: [],
    bloodPressure: { systolic: 120, diastolic: 80, type: 'normal' },
    activity: [],
    interests: [],
    age: ''
  });
  const [showPressureDetail, setShowPressureDetail] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // 🔧 ИСПРАВЛЕНИЕ: Сброс всех состояний при открытии модала
  useEffect(() => {
    if (isVisible) {
      // Сбрасываем все состояния на начальные значения
      setCurrentStep(0);
      setProfile({
        health: [],
        bloodPressure: { systolic: 120, diastolic: 80, type: 'normal' },
        activity: [],
        interests: [],
        age: ''
      });
      setShowPressureDetail(false);
      setShowCloseConfirm(false);
      
      console.log('🔄 UserProfileModal: Состояния сброшены на начальные значения');
    }
  }, [isVisible]);

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

  // Обработка закрытия модального окна
  const handleClose = () => {
    setShowCloseConfirm(true);
  };

  // Подтверждение закрытия
  const confirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
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
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }
    
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
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  // Проверка готовности для перехода
  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return profile.health.length > 0;
      case 2: return profile.activity.length > 0;
      case 3: return profile.interests.length > 0;
      case 4: return profile.age !== '';
      default: return false;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Основное модальное окно */}
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
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            position: 'relative'
          }}
        >
          {/* Кнопка закрытия */}
          <motion.button
            onClick={handleClose}
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
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Заголовок и прогресс */}
          <div style={{
            padding: '24px 24px 16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <motion.div
              style={{ fontSize: '40px', marginBottom: '12px' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌤️
            </motion.div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              {currentStep === 0 ? 'Добро пожаловать!' : `Шаг ${currentStep} из 4`}
            </h2>
            <p style={{
              margin: '0',
              fontSize: '14px',
              opacity: 0.9,
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              {currentStep === 0 
                ? 'Персонализируем EasyWeather под вас'
                : 'Настраиваем персональные рекомендации'
              }
            </p>

            {/* Прогресс-бар */}
            {currentStep > 0 && (
              <div style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                marginTop: '16px',
                overflow: 'hidden'
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
                    borderRadius: '2px'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>

          {/* Контент */}
          <div style={{
            padding: '0 24px',
            height: 'auto', // Убираем фиксированную высоту
            maxHeight: '50vh', // Максимальная высота
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <AnimatePresence mode="wait">
              {/* ПРИВЕТСТВИЕ */}
              {currentStep === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  style={{ textAlign: 'center', color: 'white' }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    Умная погода для вас!
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    opacity: 0.9,
                    marginBottom: '16px',
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    lineHeight: 1.4
                  }}>
                    4 быстрых вопроса для персональных рекомендаций о здоровье и одежде
                  </p>
                  
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>
                      🎁 Что получите:
                    </div>
                    <div style={{ fontSize: '13px', textAlign: 'left', opacity: 0.9, lineHeight: 1.3 }}>
                      • 🩺 Медицинские алерты<br/>
                      • 🏃 Спортивные советы<br/>
                      • 👶 Рекомендации для детей<br/>
                      • 🌡️ Умные предупреждения
                    </div>
                  </div>

                  <motion.button
                    onClick={nextStep}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      color: '#1a1a1a',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      fontFamily: 'Montserrat, Arial, sans-serif',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🚀 Начать настройку
                  </motion.button>
                </motion.div>
              )}

              {/* Остальные шаги опроса остаются без изменений... */}
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { id: 'meteosensitive', icon: '🩺', label: 'Метеозависимость/мигрени' },
                      { id: 'pressure', icon: '💓', label: 'Проблемы с давлением' },
                      { id: 'asthma', icon: '🫁', label: 'Астма' },
                      { id: 'allergies', icon: '🤧', label: 'Аллергии' },
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
                          padding: '12px 16px', // Уменьшили вертикальный padding
                          border: 'none',
                          borderRadius: '10px', // Немного меньше радиус
                          background: profile.health.includes(option.id)
                            ? 'rgba(255, 215, 0, 0.2)'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '15px', // Немного меньше шрифт
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: profile.health.includes(option.id)
                            ? '2px solid #ffd700'
                            : '2px solid transparent'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{option.icon}</span>
                        <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                        {profile.health.includes(option.id) && (
                          <span style={{ fontSize: '14px' }}>✓</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ДЕТАЛИ ДАВЛЕНИЯ - остается без изменений */}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'high', label: 'Высокое', icon: '📈' },
                        { id: 'low', label: 'Низкое', icon: '📉' },
                        { id: 'normal', label: 'Нормальное', icon: '✅' }
                      ].map((type) => (
                        <motion.button
                          key={type.id}
                          onClick={() => updateProfile('bloodPressure', { 
                            ...profile.bloodPressure, 
                            type: type.id,
                            systolic: type.id === 'normal' ? 120 : profile.bloodPressure.systolic,
                            diastolic: type.id === 'normal' ? 80 : profile.bloodPressure.diastolic
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

                  {/* Числовые значения только для высокого/низкого давления */}
                  {(profile.bloodPressure.type === 'high' || profile.bloodPressure.type === 'low') && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
                    >
                      <NumberPicker
                        label="Верхнее"
                        value={profile.bloodPressure.systolic}
                        onChange={(value) => updateProfile('bloodPressure', {
                          ...profile.bloodPressure,
                          systolic: value
                        })}
                        min={90}
                        max={200}
                      />
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        opacity: 0.6,
                        marginTop: '16px'
                      }}>
                        /
                      </div>
                      <NumberPicker
                        label="Нижнее"
                        value={profile.bloodPressure.diastolic}
                        onChange={(value) => updateProfile('bloodPressure', {
                          ...profile.bloodPressure,
                          diastolic: value
                        })}
                        min={50}
                        max={120}
                      />
                    </motion.div>
                  )}
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
                    Выберите все подходящие варианты
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { id: 'running', icon: '🏃', label: 'Бег/велосипед' },
                      { id: 'fitness', icon: '💪', label: 'Фитнес/прогулки' },
                      { id: 'homebody', icon: '🏠', label: 'Домосед' },
                      { id: 'children', icon: '👶', label: 'С детьми' }
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleMultiSelect('activity', option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          background: profile.activity.includes(option.id)
                            ? 'rgba(255, 215, 0, 0.2)'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '15px',
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: profile.activity.includes(option.id)
                            ? '2px solid #ffd700'
                            : '2px solid transparent'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{option.icon}</span>
                        <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                        {profile.activity.includes(option.id) && (
                          <span style={{ fontSize: '14px' }}>✓</span>
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
                    🌱 Ваши интересы?
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    marginBottom: '20px',
                    fontFamily: 'Montserrat, Arial, sans-serif'
                  }}>
                    Выберите все подходящие варианты
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { id: 'gardening', icon: '🌱', label: 'Дача/садоводство' },
                      { id: 'travel', icon: '✈️', label: 'Путешествия' },
                      { id: 'photography', icon: '📸', label: 'Фотография природы' },
                      { id: 'work', icon: '💼', label: 'Только рабочие дни' }
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
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          background: profile.interests.includes(option.id)
                            ? 'rgba(255, 215, 0, 0.2)'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '15px',
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: profile.interests.includes(option.id)
                            ? '2px solid #ffd700'
                            : '2px solid transparent'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{option.icon}</span>
                        <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                        {profile.interests.includes(option.id) && (
                          <span style={{ fontSize: '14px' }}>✓</span>
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
                    Это поможет давать подходящие советы
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                    {[
                      { id: 'young', icon: '🧒', label: 'До 18' },
                      { id: 'adult', icon: '👨', label: '18-35' },
                      { id: 'middle', icon: '👨‍💼', label: '35-55' },
                      { id: 'senior', icon: '👴', label: '55+' }
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => updateProfile('age', option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '10px',
                          background: profile.age === option.id
                            ? 'rgba(255, 215, 0, 0.2)'
                            : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '15px',
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: profile.age === option.id
                            ? '2px solid #ffd700'
                            : '2px solid transparent'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{option.icon}</span>
                        <span>{option.label}</span>
                        {profile.age === option.id && (
                          <span style={{ fontSize: '14px' }}>✓</span>
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
            padding: '10px 24px 24px 24px', // Уменьшили верхний отступ
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

            {currentStep > 0 && (
              <motion.button
                onClick={currentStep === 4 ? handleComplete : nextStep}
                disabled={!canProceed() && !showPressureDetail && currentStep > 0}
                whileHover={(canProceed() || showPressureDetail || currentStep === 0) ? { scale: 1.05 } : {}}
                whileTap={(canProceed() || showPressureDetail || currentStep === 0) ? { scale: 0.95 } : {}}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: (canProceed() || showPressureDetail || currentStep === 0)
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: (canProceed() || showPressureDetail || currentStep === 0) ? '#1a1a1a' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  cursor: (canProceed() || showPressureDetail || currentStep === 0) ? 'pointer' : 'not-allowed',
                  marginLeft: (currentStep === 1 && !showPressureDetail) ? 0 : 'auto'
                }}
              >
                {currentStep === 4 ? '🎉 Готово!' : 'Далее →'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Подтверждение закрытия */}
      <AnimatePresence>
        {showCloseConfirm && (
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
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 3500,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '300px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤔</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                Прервать настройку?
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '20px'
              }}>
                Вы можете пройти опрос позже через профиль
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Продолжить
                </button>
                <button
                  onClick={confirmClose}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserProfileModal;