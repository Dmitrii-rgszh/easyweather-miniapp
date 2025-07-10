// 🔗 useHealthIntegration.js - Хук для интеграции новой системы здоровья с App.js

import { useState, useEffect } from 'react';
import { analyzeWeatherForHealth } from '../utils/healthAnalysis';

export function useHealthIntegration(weather, userProfile, forecast) {
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);
  const [lastHealthUpdate, setLastHealthUpdate] = useState(null);

  useEffect(() => {
    if (!weather || !userProfile?.health?.length) {
      setHealthAlerts([]);
      return;
    }

    // Пропускаем анализ если пользователь здоров
    if (userProfile.health.includes('healthy') && userProfile.health.length === 1) {
      setHealthAlerts([]);
      return;
    }

    const analyzeHealth = async () => {
      setHealthLoading(true);
      setHealthError(null);

      try {
        console.log('🔗 useHealthIntegration: Запуск анализа здоровья');
        
        const alerts = await analyzeWeatherForHealth(weather, userProfile, forecast);
        
        setHealthAlerts(alerts);
        setLastHealthUpdate(new Date());
        
        console.log('✅ useHealthIntegration: Получено алертов:', alerts.length);
        
      } catch (error) {
        console.error('❌ useHealthIntegration: Ошибка анализа:', error);
        setHealthError('Не удалось проанализировать влияние погоды на здоровье');
        
        // Попробуем получить базовые алерты без магнитных бурь
        try {
          const basicAlerts = await analyzeWeatherForHealth(weather, userProfile, []);
          setHealthAlerts(basicAlerts);
        } catch (basicError) {
          console.error('❌ Критическая ошибка анализа здоровья:', basicError);
          setHealthAlerts([]);
        }
        
      } finally {
        setHealthLoading(false);
      }
    };

    // Дебаунс для предотвращения слишком частых запросов
    const timeoutId = setTimeout(analyzeHealth, 500);
    
    return () => clearTimeout(timeoutId);
    
  }, [weather, userProfile, forecast]);

  // Получение критических алертов для отображения в основном интерфейсе
  const getCriticalAlerts = () => {
    return healthAlerts.filter(alert => alert.type === 'critical');
  };

  // Получение предупреждающих алертов
  const getWarningAlerts = () => {
    return healthAlerts.filter(alert => alert.type === 'warning');
  };

  // Получение информационных алертов
  const getInfoAlerts = () => {
    return healthAlerts.filter(alert => alert.type === 'info');
  };

  // Проверка наличия алертов любого типа
  const hasHealthAlerts = () => {
    return healthAlerts.length > 0;
  };

  // Получение сводки для быстрого отображения
  const getHealthSummary = () => {
    if (!hasHealthAlerts()) {
      return {
        status: 'good',
        message: 'Погода благоприятна для здоровья',
        icon: '✅'
      };
    }

    const critical = getCriticalAlerts();
    const warnings = getWarningAlerts();

    if (critical.length > 0) {
      return {
        status: 'critical',
        message: `Критический риск: ${critical[0].title}`,
        icon: '🚨',
        count: critical.length
      };
    }

    if (warnings.length > 0) {
      return {
        status: 'warning',
        message: `Предупреждение: ${warnings[0].title}`,
        icon: '⚠️',
        count: warnings.length
      };
    }

    return {
      status: 'info',
      message: `Рекомендации: ${healthAlerts[0].title}`,
      icon: '💡',
      count: healthAlerts.length
    };
  };

  // Проверка наличия магнитных бурь
  const hasMagneticStormAlert = () => {
    return healthAlerts.some(alert => 
      alert.id.includes('magnetic') || alert.id.includes('storm')
    );
  };

  // Получение данных для статистики
  const getHealthStats = () => {
    return {
      totalAlerts: healthAlerts.length,
      criticalCount: getCriticalAlerts().length,
      warningCount: getWarningAlerts().length,
      infoCount: getInfoAlerts().length,
      hasMagneticData: hasMagneticStormAlert(),
      lastUpdate: lastHealthUpdate
    };
  };

  return {
    // Основные данные
    healthAlerts,
    healthLoading,
    healthError,
    lastHealthUpdate,
    
    // Методы фильтрации
    getCriticalAlerts,
    getWarningAlerts, 
    getInfoAlerts,
    hasHealthAlerts,
    
    // Вспомогательные методы
    getHealthSummary,
    hasMagneticStormAlert,
    getHealthStats,
    
    // Состояния для UI
    isHealthy: !hasHealthAlerts() && !healthLoading,
    hasProblems: hasHealthAlerts(),
    needsAttention: getCriticalAlerts().length > 0 || getWarningAlerts().length > 0
  };
}

// Экспорт дополнительных утилит
export const HealthStatusIcons = {
  good: '✅',
  warning: '⚠️', 
  critical: '🚨',
  info: '💡',
  loading: '⏳',
  error: '❌'
};

export const HealthStatusColors = {
  good: '#10b981',
  warning: '#f59e0b',
  critical: '#dc2626', 
  info: '#6366f1',
  loading: '#64748b',
  error: '#ef4444'
};

// Функция для краткого описания проблем со здоровьем пользователя
export function getUserHealthDescription(userProfile) {
  if (!userProfile?.health?.length) {
    return 'Не указано';
  }

  if (userProfile.health.includes('healthy') && userProfile.health.length === 1) {
    return 'Отличное здоровье';
  }

  const conditions = [];
  
  if (userProfile.health.includes('meteosensitive')) {
    conditions.push('метеозависимость');
  }
  
  if (userProfile.health.includes('pressure')) {
    const bpType = userProfile.bloodPressure?.type;
    if (bpType === 'high') conditions.push('гипертония');
    else if (bpType === 'low') conditions.push('гипотония'); 
    else conditions.push('проблемы с давлением');
  }
  
  if (userProfile.health.includes('asthma')) {
    conditions.push('астма');
  }
  
  if (userProfile.health.includes('allergies')) {
    conditions.push('аллергии');
  }

  return conditions.length > 0 ? conditions.join(', ') : 'Не указано';
}

export default useHealthIntegration;