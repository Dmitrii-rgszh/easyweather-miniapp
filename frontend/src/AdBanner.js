// 🎨 AdBanner.js - Реклама для бесплатного приложения

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Показываем баннер через 2 секунды после загрузки
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Не показываем только если пользователь закрыл
  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '0',
          right: '0',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px',
          pointerEvents: 'none'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, #0066cc 0%, #004999 100%)',
            borderRadius: '18px',
            padding: '20px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '380px',
            minWidth: '320px',
            pointerEvents: 'auto'
          }}
          onClick={() => window.open('https://vtb.ru/l/m6e34kae', '_blank')}
        >
          {/* Фоновый эффект */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'shimmer 3s infinite'
          }} />
          
          {/* Кнопка закрытия */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
            {/* Логотип ВТБ */}
            <div style={{
              width: '54px',
              height: '54px',
              background: 'white',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: '#0066cc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}>
              ВТБ
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Заголовок */}
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '4px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                lineHeight: '1.2'
              }}>
                💳 +1000₽ на карту + навсегда бесплатно
              </div>
              
              {/* Подзаголовок */}
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                marginBottom: '6px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                lineHeight: '1.2'
              }}>
                ⭐ Автор EasyWeather делится секретом
              </div>
            </div>

            {/* Кнопка */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.3)',
                fontFamily: 'Montserrat, Arial, sans-serif',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              Получить
            </motion.div>
          </div>
        </motion.div>

        {/* CSS для анимации */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @media (max-width: 420px) {
            .ad-banner-container {
              padding: 0 15px !important;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdBanner;
