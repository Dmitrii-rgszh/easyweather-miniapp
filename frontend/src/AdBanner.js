// 🧪 A/B ТЕСТИРОВАНИЕ БАННЕРОВ - Исправленный AdBanner.js

import analytics from './analytics';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 ВАРИАНТЫ БАННЕРОВ ДЛЯ A/B ТЕСТИРОВАНИЯ
const BANNER_VARIANTS = [
  {
    id: 'variant_a',
    name: 'Классический',
    title: '💳 +1000₽ на карту + навсегда бесплатно',
    subtitle: '⭐ Автор EasyWeather делится секретом',
    buttonText: 'Получить',
    colors: {
      primary: '#0066cc',
      secondary: '#004999',
      button: 'rgba(255,255,255,0.2)'
    }
  },
  {
    id: 'variant_b', 
    name: 'Трендовый',
    title: '🔥 Лучшая карта 2025 + 1000₽ бонус',
    subtitle: '⭐ Автор EasyWeather делится секретом',
    buttonText: 'Хочу!',
    colors: {
      primary: '#ff6b35',
      secondary: '#e55a2b', 
      button: 'rgba(255,255,255,0.25)'
    }
  },
  {
    id: 'variant_c',
    name: 'Скоростной', 
    title: '⚡ Мгновенная карта + кэшбэк до 30%',
    subtitle: '⭐ Автор EasyWeather делится секретом',
    buttonText: 'Быстро!',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      button: 'rgba(255,255,255,0.2)'
    }
  }
];

const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [currentVariant, setCurrentVariant] = useState(null);
  const [abTestId, setAbTestId] = useState('');

  // 🔧 ОТЛАДКА - показываем все варианты в консоли
  useEffect(() => {
    console.log('🎯 Доступные варианты A/B теста:', BANNER_VARIANTS.map(v => ({
      id: v.id,
      name: v.name,
      title: v.title
    })));
  }, []);

  // 🎲 ВЫБОР ВАРИАНТА ДЛЯ A/B ТЕСТИРОВАНИЯ
  useEffect(() => {
    // 🔧 ОТЛАДКА - показываем что сохранено в localStorage
    console.log('📦 Сохраненные данные A/B теста:', {
      savedVariant: localStorage.getItem('abTestVariant'),
      savedTestId: localStorage.getItem('abTestId')
    });
  
    // Проверяем есть ли уже выбранный вариант в сессии
    let savedVariant = localStorage.getItem('abTestVariant');
    let savedTestId = localStorage.getItem('abTestId');
    
    if (!savedVariant || !savedTestId) {
      // Случайно выбираем вариант
      const randomIndex = Math.floor(Math.random() * BANNER_VARIANTS.length);
      const selectedVariant = BANNER_VARIANTS[randomIndex];
      
      // Генерируем уникальный ID теста
      const testId = `ab_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      localStorage.setItem('abTestVariant', selectedVariant.id);
      localStorage.setItem('abTestId', testId);
      
      setCurrentVariant(selectedVariant);
      setAbTestId(testId);
      
      console.log('🧪 A/B тест запущен:', {
        variant: selectedVariant.name,
        id: selectedVariant.id,
        testId: testId
      });
    } else {
      // Используем сохраненный вариант
      const variant = BANNER_VARIANTS.find(v => v.id === savedVariant) || BANNER_VARIANTS[0];
      setCurrentVariant(variant);
      setAbTestId(savedTestId);
      
      console.log('🔄 Продолжаем A/B тест:', {
        variant: variant.name,
        id: variant.id,
        testId: savedTestId
      });
    }
  }, []);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Добавляем функцию в window для вызова из консоли
      window.resetABTest = () => {
        localStorage.removeItem('abTestVariant');
        localStorage.removeItem('abTestId');
        console.log('🔄 A/B тест сброшен! Перезагрузите страницу.');
        window.location.reload();
      };
    
      window.forceVariant = (variantId) => {
        const variant = BANNER_VARIANTS.find(v => v.id === variantId);
        if (variant) {
          localStorage.setItem('abTestVariant', variantId);
          localStorage.setItem('abTestId', `forced_${Date.now()}`);
          console.log(`🎯 Принудительно выбран вариант: ${variant.name}`);
          window.location.reload();
        } else {
          console.log('❌ Неверный ID варианта. Доступные:', BANNER_VARIANTS.map(v => v.id));
        }
      };
    
      console.log('🛠️ Функции для отладки A/B теста добавлены в window:');
      console.log('• window.resetABTest() - сбросить тест');
      console.log('• window.forceVariant("variant_a") - принудительно выбрать вариант');
    }
  }, []);
  // Показываем баннер через 2 секунды после загрузки
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 🆕 ГЕНЕРИРУЕМ SESSION ID ПРИ СТАРТЕ
  useEffect(() => {
    let currentSessionId = localStorage.getItem('userSessionId');
    
    if (!currentSessionId) {
      currentSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userSessionId', currentSessionId);
    }
    
    setSessionId(currentSessionId);
  }, []);

  // 🆕 ОТСЛЕЖИВАНИЕ ПОКАЗОВ БАННЕРА С A/B ДАННЫМИ
  useEffect(() => {
    if (isVisible && sessionId && currentVariant) {
      const timer = setTimeout(() => {
        analytics.trackBannerView(currentVariant.id);
        
        // Отправляем показ на сервер с данными A/B теста
        fetch('http://localhost:3001/api/analytics/banner-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            banner_id: currentVariant.id,
            page_url: window.location.href,
            sessionId: sessionId,
            event_type: 'impression',
            campaign_id: `ab_test_${abTestId}`,
            user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
          })
        }).then(response => response.json())
          .then(result => {
            if (result.success) {
              console.log('✅ Показ A/B варианта записан:', currentVariant.name);
            }
          })
          .catch(error => {
            console.error('❌ Ошибка записи показа A/B теста:', error);
          });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, sessionId, currentVariant, abTestId]);

  // 🚀 ФУНКЦИЯ ОТПРАВКИ КЛИКА НА СЕРВЕР (СТАРАЯ ВЕРСИЯ ДЛЯ СОВМЕСТИМОСТИ)
  const sendClickToServer = async (sessionId) => {
    try {
      const response = await fetch('http://localhost:3001/api/analytics/banner-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Клик по баннеру записан на сервер (старая версия):', result);
      } else {
        console.error('❌ Ошибка записи клика:', result.error);
      }
    } catch (error) {
      console.error('❌ Ошибка отправки аналитики:', error);
    }
  };

  // 🎯 ОБНОВЛЕННАЯ ФУНКЦИЯ ОБРАБОТКИ КЛИКА С A/B ТЕСТИРОВАНИЕМ
  const handleBannerClick = async (event) => {
    if (!currentVariant) return;
    
    console.log('🎯 Клик по A/B варианту:', currentVariant.name);
    
    // 🆕 ПОЛУЧАЕМ КООРДИНАТЫ КЛИКА
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const coordinates = `${Math.round(x)},${Math.round(y)}`;
    
    // 🆕 ОТСЛЕЖИВАЕМ КЛИК ПО БАННЕРУ В ТЕЛЕГРАМ АНАЛИТИКЕ
    analytics.trackBannerClick(currentVariant.id);
    
    // 🚀 НОВАЯ АНАЛИТИКА С A/B ДАННЫМИ
    try {
      const response = await fetch('http://localhost:3001/api/analytics/banner-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banner_id: currentVariant.id,
          click_coordinates: coordinates,
          page_url: window.location.href,
          user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null,
          sessionId: sessionId,
          campaign_id: `ab_test_${abTestId}`,
          variant_name: currentVariant.name
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ A/B клик записан:', {
          variant: currentVariant.name,
          coordinates: coordinates,
          clickId: result.clickId || result.click_id
        });
      } else {
        console.error('❌ Ошибка новой A/B аналитики:', result.error);
      }
    } catch (error) {
      console.error('❌ Ошибка A/B аналитики:', error);
    }
    
    // 🔄 СТАРАЯ АНАЛИТИКА (ДЛЯ СОВМЕСТИМОСТИ)
    if (sessionId) {
      sendClickToServer(sessionId);
    }
    
    // 📊 ДУБЛИРУЕМ В LOCALSTORAGE ДЛЯ СОВМЕСТИМОСТИ 
    const savedClicks = localStorage.getItem('bannerClicks') || '0';
    const newCount = parseInt(savedClicks) + 1;
    localStorage.setItem('bannerClicks', newCount.toString());
    localStorage.setItem('lastBannerClick', new Date().toISOString());
    
    // 🎉 ЗАПИСЫВАЕМ УСПЕШНУЮ КОНВЕРСИЮ A/B ТЕСТА
    localStorage.setItem(`abTest_${currentVariant.id}_conversions`, 
      (parseInt(localStorage.getItem(`abTest_${currentVariant.id}_conversions`) || '0') + 1).toString()
    );
    
    // 🚀 ОТКРЫВАЕМ ССЫЛКУ
    window.open('https://vtb.ru/l/m6e34kae', '_blank');
  };

  // Не показываем только если пользователь закрыл или вариант не выбран
  if (!isVisible || !currentVariant) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Отслеживаем закрытие баннера с A/B данными
    analytics.trackAction('banner_dismiss', { 
      banner_id: currentVariant.id,
      variant_name: currentVariant.name
    });
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
            background: `linear-gradient(135deg, ${currentVariant.colors.primary} 0%, ${currentVariant.colors.secondary} 100%)`,
            borderRadius: '18px',
            padding: '10px',
            color: 'white',
            boxShadow: `0 8px 32px ${currentVariant.colors.primary}40`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '380px',
            minWidth: '320px',
            pointerEvents: 'auto'
          }}
          onClick={handleBannerClick}
        >

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
              width: '24px',
              height: '24px',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
            title="Закрыть баннер"
          >
            ×
          </button>

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
              color: currentVariant.colors.primary,
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
                {currentVariant.title}
              </div>
              
              {/* Подзаголовок */}
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                fontFamily: 'Montserrat, Arial, sans-serif',
                lineHeight: '1.2'
              }}>
                {currentVariant.subtitle}
              </div>
            </div>

            {/* Кнопка */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: currentVariant.colors.button,
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
              {currentVariant.buttonText}
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

