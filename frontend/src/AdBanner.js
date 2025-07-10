// 🎨 AdBanner.js - Обновленная реклама (рекомендация автора)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdBanner = ({ isPremium }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Не показываем рекламу Premium пользователям
  if (isPremium || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay: 2 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: '340px',
          width: 'calc(100% - 40px)',
          margin: '0 auto'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, #0066cc 0%, #004999 100%)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            margin: '0 auto'
          }}
          onClick={() => window.open('https://www.vtb.ru/personal/karty/', '_blank')}
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
              setIsVisible(false);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
            {/* Логотип ВТБ */}
            <div style={{
              width: '48px',
              height: '48px',
              background: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: '#0066cc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              ВТБ
            </div>

            <div style={{ flex: 1 }}>
              {/* Заголовок */}
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '2px',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                💳 Карта с кэшбэком + кешбэк
              </div>
              
              {/* Подзаголовок */}
              <div style={{
                fontSize: '11px',
                opacity: 0.9,
                marginBottom: '4px',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                🎯 Рекомендация автора EasyWeather
              </div>

              {/* Процент */}
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#ffeb3b'
              }}>
                до 15% 
                <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: '400' }}>
                  на категории
                </span>
              </div>
            </div>

            {/* Кнопка */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.3)',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}
            >
              Узнать
            </motion.div>
          </div>

          {/* Дополнительная информация */}
          <div style={{
            marginTop: '8px',
            fontSize: '9px',
            opacity: 0.7,
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            💡 Автор проекта лично пользуется этой картой
          </div>
        </motion.div>

        {/* CSS для анимации */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

const bannerStyle = `
  .ad-banner-container {
    position: fixed !important;
    bottom: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: calc(100vw - 40px) !important;
    max-width: 340px !important;
    z-index: 1000 !important;
  }
`;

export default AdBanner;
