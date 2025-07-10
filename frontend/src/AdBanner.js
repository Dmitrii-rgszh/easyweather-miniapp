// 🎨 AdBanner.js - Обновленная реклама с правильным центрированием

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
          left: '0',
          right: '0',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px', // Добавляем отступы по бокам
          pointerEvents: 'none' // Убираем события с контейнера
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
            maxWidth: '380px', // Увеличили максимальную ширину
            minWidth: '320px', // Увеличили минимальную ширину
            pointerEvents: 'auto' // Возвращаем события для баннера
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
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center',             gap: '14px', position: 'relative', zIndex: 2 }}>
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0 // Предотвращаем сжатие логотипа
            }}>
              ВТБ
            </div>

            <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 для правильного flex */}
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
                ⭐ Автор EasyWeather рекомендует
              </div>

              {/* Процент - убираем */}
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
                flexShrink: 0, // Предотвращаем сжатие кнопки
                whiteSpace: 'nowrap' // Предотвращаем перенос текста
              }}
            >
              Получить
            </motion.div>
          </div>

          {/* Дополнительная информация - убираем */}
        </motion.div>

        {/* CSS для анимации */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          /* Дополнительные стили для центрирования */
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

// Дополнительные CSS стили для гарантированного центрирования
const bannerStyle = `
  .ad-banner-container {
    position: fixed !important;
    bottom: 20px !important;
    left: 0 !important;
    right: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 0 20px !important;
    z-index: 1000 !important;
    pointer-events: none !important;
  }
  
  .ad-banner-content {
    width: 100% !important;
    max-width: 380px !important;
    min-width: 320px !important;
    pointer-events: auto !important;
  }
`;

export default AdBanner;
