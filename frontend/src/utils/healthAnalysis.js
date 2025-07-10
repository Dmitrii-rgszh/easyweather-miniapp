// 🏥 healthAnalysis.js - Анализ погодных условий для здоровья

// Пороговые значения для медицинских алертов
const HEALTH_THRESHOLDS = {
  pressure: {
    low: 740,      // мм рт.ст. - низкое давление
    high: 770,     // мм рт.ст. - высокое давление
    critical_low: 720,
    critical_high: 780
  },
  humidity: {
    low: 30,       // % - сухой воздух
    high: 80,      // % - повышенная влажность
    critical_high: 90
  },
  temperature: {
    heat_stress: 28,    // °C - тепловой стресс
    cold_stress: -5,    // °C - холодовой стресс
    extreme_heat: 35,
    extreme_cold: -15
  },
  wind: {
    strong: 15,    // м/с - сильный ветер
    very_strong: 25
  }
};

// Типы медицинских состояний
const HEALTH_CONDITIONS = {
  hypertension: 'Гипертония',
  hypotension: 'Гипотония', 
  migraine: 'Мигрень',
  arthritis: 'Артрит',
  asthma: 'Астма',
  heart_disease: 'Заболевания сердца',
  meteoropathy: 'Метеозависимость'
};

// Анализ погодных условий для здоровья
export function analyzeWeatherForHealth(weather, userProfile, forecast = []) {
  const alerts = [];
  
  if (!weather || !userProfile) return alerts;
  
  const temp = weather.temp;
  const pressure = weather.details?.pressure || 760;
  const humidity = weather.details?.humidity || 50;
  const windSpeed = parseFloat(weather.details?.wind?.replace(' м/с', '') || '0');
  const conditions = userProfile.healthConditions || [];
  
  // 🔴 КРИТИЧЕСКИЕ АЛЕРТЫ
  
  // Экстремальное давление
  if (pressure <= HEALTH_THRESHOLDS.pressure.critical_low) {
    alerts.push({
      id: 'critical_low_pressure',
      type: 'critical',
      icon: '🆘',
      title: 'КРИТИЧЕСКИ НИЗКОЕ ДАВЛЕНИЕ',
      message: `Атмосферное давление ${pressure} мм рт.ст. - опасно низкое!`,
      color: '#dc2626',
      bgColor: '#dc262615',
      priority: 1,
      conditions: ['hypertension', 'hypotension', 'migraine', 'heart_disease'],
      advice: [
        '🚨 СРОЧНО обратитесь к врачу при плохом самочувствии',
        '💊 Примите привычные лекарства по назначению врача',
        '🛏️ Больше отдыхайте, избегайте физических нагрузок',
        '💧 Пейте больше воды'
      ]
    });
  }
  
  if (pressure >= HEALTH_THRESHOLDS.pressure.critical_high) {
    alerts.push({
      id: 'critical_high_pressure',
      type: 'critical',
      icon: '🆘',
      title: 'КРИТИЧЕСКИ ВЫСОКОЕ ДАВЛЕНИЕ',
      message: `Атмосферное давление ${pressure} мм рт.ст. - опасно высокое!`,
      color: '#dc2626',
      bgColor: '#dc262615',
      priority: 1,
      conditions: ['hypertension', 'heart_disease'],
      advice: [
        '🚨 СРОЧНО измерьте артериальное давление',
        '💊 При необходимости примите лекарства',
        '🚶‍♂️ Ограничьте физическую активность',
        '🧘‍♀️ Выполните дыхательные упражнения'
      ]
    });
  }
  
  // 🟡 ПРЕДУПРЕЖДАЮЩИЕ АЛЕРТЫ
  
  // Низкое давление (гипотоники)
  if (pressure <= HEALTH_THRESHOLDS.pressure.low && 
      (conditions.includes('hypotension') || conditions.includes('meteoropathy'))) {
    alerts.push({
      id: 'low_pressure_warning',
      type: 'warning',
      icon: '📉',
      title: 'Низкое атмосферное давление',
      message: `${pressure} мм рт.ст. - возможно ухудшение самочувствия`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 2,
      conditions: ['hypotension', 'meteoropathy'],
      advice: [
        '☕ Выпейте кофе или крепкий чай',
        '🚿 Примите контрастный душ',
        '🏃‍♀️ Легкая физическая активность поможет',
        '😴 Высыпайтесь (8-9 часов сна)'
      ]
    });
  }
  
  // Высокое давление (гипертоники)
  if (pressure >= HEALTH_THRESHOLDS.pressure.high && 
      (conditions.includes('hypertension') || conditions.includes('heart_disease'))) {
    alerts.push({
      id: 'high_pressure_warning',
      type: 'warning',
      icon: '📈',
      title: 'Высокое атмосферное давление',
      message: `${pressure} мм рт.ст. - следите за артериальным давлением`,
      color: '#ef4444',
      bgColor: '#ef444415',
      priority: 2,
      conditions: ['hypertension', 'heart_disease'],
      advice: [
        '🩺 Измерьте артериальное давление',
        '🧂 Ограничьте соль в рационе',
        '🚶‍♀️ Избегайте интенсивных нагрузок',
        '🧘‍♀️ Практикуйте релаксацию'
      ]
    });
  }
  
  // Мигрень - комплексный анализ
  if (conditions.includes('migraine')) {
    const migraineTriggers = [];
    
    if (pressure <= 745 || pressure >= 765) migraineTriggers.push('перепады давления');
    if (humidity >= 80) migraineTriggers.push('высокая влажность');
    if (windSpeed >= 15) migraineTriggers.push('сильный ветер');
    if (temp >= 28 || temp <= 5) migraineTriggers.push('экстремальная температура');
    
    if (migraineTriggers.length > 0) {
      alerts.push({
        id: 'migraine_warning',
        type: 'warning',
        icon: '🤕',
        title: 'Риск мигрени',
        message: `Выявлены триггеры: ${migraineTriggers.join(', ')}`,
        color: '#8b5cf6',
        bgColor: '#8b5cf615',
        priority: 2,
        conditions: ['migraine'],
        advice: [
          '💊 Имейте при себе обезболивающие',
          '🕶️ Носите солнцезащитные очки',
          '💧 Пейте достаточно воды',
          '😴 Избегайте стресса и недосыпа',
          '🍫 Избегайте триггерных продуктов'
        ]
      });
    }
  }
  
  // Астма и качество воздуха
  if (conditions.includes('asthma')) {
    if (humidity >= 80) {
      alerts.push({
        id: 'asthma_humidity',
        type: 'warning',
        icon: '🫁',
        title: 'Высокая влажность - риск для астматиков',
        message: `Влажность ${humidity}% может затруднить дыхание`,
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 2,
        conditions: ['asthma'],
        advice: [
          '💨 Имейте при себе ингалятор',
          '🏠 Используйте осушитель воздуха дома',
          '🚶‍♀️ Ограничьте активность на улице',
          '😷 Рассмотрите использование маски'
        ]
      });
    }
    
    if (temp <= 0) {
      alerts.push({
        id: 'asthma_cold',
        type: 'warning',
        icon: '🥶',
        title: 'Холодный воздух - риск для астматиков',
        message: `${temp}°C - холодный воздух может вызвать приступ`,
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 2,
        conditions: ['asthma'],
        advice: [
          '💨 Обязательно носите ингалятор',
          '🧣 Прикрывайте нос и рот шарфом',
          '🏠 Разогревайтесь дома перед выходом',
          '⏰ Ограничьте время на улице'
        ]
      });
    }
  }
  
  // Артрит и изменения погоды
  if (conditions.includes('arthritis')) {
    if (humidity >= 70 && temp <= 10) {
      alerts.push({
        id: 'arthritis_weather',
        type: 'info',
        icon: '🦴',
        title: 'Погода может усилить боли в суставах',
        message: `Холод и влажность могут обострить артрит`,
        color: '#64748b',
        bgColor: '#64748b15',
        priority: 3,
        conditions: ['arthritis'],
        advice: [
          '🔥 Держите суставы в тепле',
          '🛁 Примите теплую ванну',
          '💊 Имейте при себе обезболивающие',
          '🧘‍♀️ Делайте легкую растяжку'
        ]
      });
    }
  }
  
  // 🟢 ПОЗИТИВНЫЕ АЛЕРТЫ
  
  // Идеальная погода для здоровья
  if (pressure >= 750 && pressure <= 765 && 
      humidity >= 40 && humidity <= 70 && 
      temp >= 18 && temp <= 24 && 
      windSpeed <= 10) {
    alerts.push({
      id: 'perfect_health_weather',
      type: 'excellent',
      icon: '🌟',
      title: 'Идеальная погода для здоровья!',
      message: `Все показатели в норме - отличный день для активности`,
      color: '#10b981',
      bgColor: '#10b98115',
      priority: 4,
      conditions: ['all'],
      advice: [
        '🚶‍♀️ Отличный день для прогулки',
        '🏃‍♂️ Можно заниматься спортом',
        '🪟 Проветрите помещение',
        '😊 Хорошее время для важных дел'
      ]
    });
  }
  
  // Прогноз на ближайшие часы
  if (forecast.length > 0) {
    const nextHours = forecast.slice(0, 3);
    const pressureChanges = [];
    
    nextHours.forEach((item, index) => {
      const nextPressure = Math.round(item.main.pressure * 0.750062);
      const change = nextPressure - pressure;
      
      if (Math.abs(change) >= 5) {
        pressureChanges.push({
          time: index + 3,
          change: change,
          pressure: nextPressure
        });
      }
    });
    
    if (pressureChanges.length > 0 && 
        (conditions.includes('meteoropathy') || conditions.includes('migraine'))) {
      const biggestChange = pressureChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
      
      alerts.push({
        id: 'pressure_forecast',
        type: 'info',
        icon: '📊',
        title: 'Прогноз изменения давления',
        message: `Через ${biggestChange.time}ч давление ${biggestChange.change > 0 ? 'повысится' : 'понизится'} на ${Math.abs(biggestChange.change)} мм рт.ст.`,
        color: '#6366f1',
        bgColor: '#6366f115',
        priority: 3,
        conditions: ['meteoropathy', 'migraine'],
        advice: [
          '⏰ Подготовьтесь к изменению самочувствия',
          '💊 Имейте лекарства под рукой',
          '😴 Высыпайтесь перед изменением погоды'
        ]
      });
    }
  }
  
  // Фильтруем алерты по состояниям пользователя
  return alerts.filter(alert => 
    alert.conditions.includes('all') || 
    alert.conditions.some(condition => conditions.includes(condition))
  ).sort((a, b) => a.priority - b.priority);
}

// Получение данных о магнитных бурях (заглушка для API NOAA)
export async function getMagneticStormData() {
  // В реальном приложении здесь будет запрос к NOAA Space Weather API
  // https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
  
  try {
    // Заглушка с реалистичными данными
    return {
      current_activity: 'quiet', // quiet, unsettled, active, storm
      kp_index: 2, // 0-9 (магнитная активность)
      forecast_24h: 'quiet',
      alerts: []
    };
  } catch (error) {
    console.error('Ошибка получения данных о магнитных бурях:', error);
    return null;
  }
}

// Анализ магнитных бурь для метеозависимых
export function analyzeMagneticStorms(stormData, userProfile) {
  if (!stormData || !userProfile?.healthConditions?.includes('meteoropathy')) {
    return [];
  }
  
  const alerts = [];
  
  if (stormData.kp_index >= 5) {
    alerts.push({
      id: 'magnetic_storm',
      type: 'warning',
      icon: '🌌',
      title: 'Магнитная буря',
      message: `Геомагнитная активность повышена (Kp=${stormData.kp_index})`,
      color: '#7c3aed',
      bgColor: '#7c3aed15',
      priority: 2,
      advice: [
        '😴 Больше отдыхайте',
        '💧 Пейте больше воды',
        '🧘‍♀️ Избегайте стресса',
        '📱 Ограничьте использование гаджетов'
      ]
    });
  }
  
  return alerts;
}