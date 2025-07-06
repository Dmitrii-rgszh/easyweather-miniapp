import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumModal = ({ isVisible, onClose, onUpgrade, usageStats }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const premiumFeatures = [
    {
      icon: "🤖",
      title: "ИИ Метеоролог-Консультант",
      description: "Персональный ИИ анализирует ваш стиль жизни и дает умные советы",
      demo: "Сегодня дождь + у вас встреча → 'Возьмите зонт и выйдите на 15 минут раньше'",
      wow: "🧠 Обучается на ваших привычках!"
    },
    {
      icon: "📊",
      title: "Погодная Аналитика Pro",
      description: "Тренды, статистика, прогнозы на основе ваших данных",
      demo: "За месяц вы 12 раз попали под дождь. Рекомендуем зонт в сумке.",
      wow: "📈 Ваша личная метеостанция!"
    },
    {
      icon: "🌍",
      title: "Мультигород Трекинг",
      description: "Отслеживайте погоду в 10 городах одновременно",
      demo: "Москва +15°, Сочи +22°, Нью-Йорк +8° - все в одном экране",
      wow: "🗺️ Ваш погодный мир!"
    },
    {
      icon: "⚡",
      title: "Мгновенные Алерты",
      description: "Push-уведомления о резких изменениях погоды",
      demo: "ВНИМАНИЕ! Через 30 минут начнется гроза. Время укрыться!",
      wow: "🔔 Всегда на шаг впереди!"
    },
    {
      icon: "🎨",
      title: "Премиум Темы & Виджеты",
      description: "Эксклюзивные дизайны и персонализация",
      demo: "Темная тема, неоновые эффекты, анимированные фоны",
      wow: "✨ Ваш уникальный стиль!"
    }
  ];

  // Автопрокрутка фич
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % premiumFeatures.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible, premiumFeatures.length]);

  if (!isVisible) return null;

  const feature = premiumFeatures[currentFeature];

  return (
    <AnimatePresence>
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
          zIndex: 2000,
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
          {/* Блестящий эффект */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              zIndex: 1
            }}
            animate={{
              left: ['100%', '100%', '-100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />

          <div style={{ padding: '32px', position: 'relative', zIndex: 2 }}>
            {/* Заголовок с лимитом */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <motion.div
                style={{
                  fontSize: '48px',
                  marginBottom: '8px'
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💎
              </motion.div>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                Premium Upgrade
              </h2>
              <p style={{
                margin: '0',
                fontSize: '14px',
                opacity: 0.9
              }}>
                🔥 Лимит исчерпан: {usageStats?.used || 0}/{usageStats?.limit || 5} запросов
              </p>
            </div>

            {/* Текущая фича */}
            <motion.div
              key={currentFeature}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div style={{
                fontSize: '32px',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {feature.title}
              </h3>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                textAlign: 'center',
                opacity: 0.9
              }}>
                {feature.description}
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontStyle: 'italic',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                "{feature.demo}"
              </div>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '13px',
                fontWeight: '600',
                textAlign: 'center',
                color: '#ffd700'
              }}>
                {feature.wow}
              </p>
            </motion.div>

            {/* Индикаторы фич */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}>
              {premiumFeatures.map((_, index) => (
                <motion.div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: index === currentFeature ? '#ffd700' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentFeature(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Кнопки */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                onClick={onUpgrade}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
                }}
              >
                🚀 Получить Premium
              </motion.button>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  cursor: 'pointer'
                }}
              >
                Позже
              </motion.button>
            </div>

            {/* Социальное доказательство */}
            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '12px',
              opacity: 0.8
            }}>
              ⭐ 2,847 пользователей уже выбрали Premium
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumModal;