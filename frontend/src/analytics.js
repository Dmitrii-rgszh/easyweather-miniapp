// 🔧 ИНТЕГРАЦИЯ ТЕЛЕГРАМ АНАЛИТИКИ В EASYWEATHER

// 1. Создай новый файл src/analytics.js:

// analytics.js - Система аналитики для EasyWeather
class EasyWeatherAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.telegramId = this.getTelegramId();
    this.sessionStartTime = Date.now();
    this.isSessionActive = false;
    
    // Инициализируем сессию при создании
    this.initSession();
  }

  // Генерация уникального ID сессии
  generateSessionId() {
    return 'ew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Получение Telegram ID пользователя
  getTelegramId() {
    // Для тестирования используем фиксированный ID
    // В реальном приложении будет из Telegram Web App
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      return window.Telegram.WebApp.initDataUnsafe.user?.id || 999999999;
    }
    
    // Для локального тестирования
    return 999999999;
  }

  // Инициализация сессии
  async initSession() {
    if (this.isSessionActive) return;
    
    try {
      const response = await fetch('/api/miniapp/session-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: this.telegramId,
          session_id: this.sessionId,
          platform: this.detectPlatform(),
          init_data: window.Telegram?.WebApp?.initData || 'test_data'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.isSessionActive = true;
        console.log('📱 Сессия Mini App инициализирована:', this.sessionId);
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации сессии:', error);
    }
  }

  // Определение платформы
  detectPlatform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'mac';
    return 'web';
  }

  // Отслеживание действий пользователя
  async trackAction(actionType, actionData = {}, pageUrl = null, elementId = null) {
    if (!this.isSessionActive) return;

    try {
      const response = await fetch('/api/miniapp/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: this.telegramId,
          session_id: this.sessionId,
          action_type: actionType,
          action_data: actionData,
          page_url: pageUrl || window.location.pathname,
          element_id: elementId
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('🎬 Действие записано:', actionType, actionData);
      }
    } catch (error) {
      console.error('❌ Ошибка записи действия:', error);
    }
  }

  // Завершение сессии
  async endSession() {
    if (!this.isSessionActive) return;

    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    
    try {
      const response = await fetch('/api/miniapp/session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          duration_seconds: duration
        })
      });

      const result = await response.json();
      if (result.success) {
        this.isSessionActive = false;
        console.log('⏰ Сессия завершена, длительность:', duration, 'сек');
      }
    } catch (error) {
      console.error('❌ Ошибка завершения сессии:', error);
    }
  }

  // Специальные методы для EasyWeather
  trackWeatherSearch(city, method = 'manual') {
    this.trackAction('weather_search', { city, method });
  }

  trackBannerView(bannerId = 'vtb_card') {
    this.trackAction('banner_view', { banner_id: bannerId });
  }

  trackBannerClick(bannerId = 'vtb_card') {
    this.trackAction('banner_click', { banner_id: bannerId });
  }

  trackProfileUpdate(updateType, data = {}) {
    this.trackAction('profile_update', { update_type: updateType, ...data });
  }

  trackPageView(pageName) {
    this.trackAction('page_view', { page: pageName });
  }

  trackShare(shareType, data = {}) {
    this.trackAction('share', { share_type: shareType, ...data });
  }
}

// Создаем глобальный экземпляр аналитики
const analytics = new EasyWeatherAnalytics();

// Автоматическое завершение сессии при закрытии страницы
window.addEventListener('beforeunload', () => {
  analytics.endSession();
});

// Отслеживание видимости страницы
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    analytics.endSession();
  } else {
    analytics.initSession();
  }
});

export default analytics;