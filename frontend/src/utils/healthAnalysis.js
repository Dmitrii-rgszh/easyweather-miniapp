// 🏥 healthAnalysis.js - Улучшенная система анализа здоровья с исправленным импортом

// Медицинские пороги для различных состояний
const HEALTH_THRESHOLDS = {
  pressure: {
    very_low: 735,
    low: 745,
    normal_low: 750,
    normal_high: 765,
    high: 770,
    very_high: 780
  },
  humidity: {
    low: 30,
    comfortable: 60,
    high: 75,
    very_high: 85
  },
  temperature: {
    very_cold: 0,
    cold: 10,
    cool: 18,
    warm: 25,
    hot: 30,
    very_hot: 35
  },
  wind: {
    calm: 3,
    light: 8,
    moderate: 15,
    strong: 25
  },
  kp_index: {
    quiet: 3,
    unsettled: 4,
    active: 5,
    storm: 7
  }
};

// Простая функция получения данных о магнитных бурях (без внешнего API пока)
async function getSpaceWeatherData() {
  try {
    // Заглушка с реалистичными данными пока API не подключен
    const mockData = {
      kp_index: {
        current_kp: Math.random() * 3 + 1, // 1-4
        activity_level: 'quiet',
        trend: 'stable'
      }
    };
    
    // В будущем здесь будет реальный API
    // const { getCompleteSpaceWeather } = await import('../spaceWeather');
    // return await getCompleteSpaceWeather();
    
    return mockData;
    
  } catch (error) {
    console.error('❌ Ошибка получения космической погоды:', error);
    return null;
  }
}

// Получение русского описания уровня активности
function getActivityLevelRu(level) {
  const levels = {
    'quiet': 'Спокойная',
    'unsettled': 'Неустойчивая', 
    'active': 'Активная',
    'minor_storm': 'Слабая буря',
    'moderate_storm': 'Умеренная буря',
    'strong_storm': 'Сильная буря',
    'severe_storm': 'Экстремальная буря',
    'unknown': 'Неизвестно'
  };
  return levels[level] || 'Неизвестно';
}

// Маппинг состояний здоровья пользователя на медицинские коды
function mapHealthConditions(userProfile) {
  const conditions = [];
  
  if (!userProfile?.health) return conditions;
  
  userProfile.health.forEach(condition => {
    switch (condition) {
      case 'meteosensitive':
        conditions.push('meteoropathy', 'migraine');
        break;
      case 'pressure':
        // Определяем тип проблем с давлением
        const bpType = userProfile.bloodPressure?.type;
        if (bpType === 'high') conditions.push('hypertension');
        if (bpType === 'low') conditions.push('hypotension');
        if (bpType === 'variable') conditions.push('hypertension', 'hypotension');
        conditions.push('heart_disease');
        break;
      case 'asthma':
        conditions.push('asthma', 'respiratory');
        break;
      case 'allergies':
        conditions.push('allergies');
        break;
      case 'arthritis':
        conditions.push('arthritis', 'joints');
        break;
      case 'healthy':
        // Не добавляем состояния
        break;
    }
  });
  
  return [...new Set(conditions)]; // Убираем дубликаты
}

// Основная функция анализа погодных условий для здоровья
export async function analyzeWeatherForHealth(weather, userProfile, forecastData = []) {
  const alerts = [];
  const conditions = mapHealthConditions(userProfile);
  
  if (conditions.length === 0) return alerts;
  
  // Извлекаем данные о погоде
  const pressure = weather.details?.pressure || 760;
  const humidity = weather.details?.humidity || 50;
  const temp = weather.temp || 20;
  const windSpeed = parseFloat(weather.details?.wind?.replace(' м/с', '') || '0');
  
  console.log('🩺 Анализируем здоровье:', { pressure, humidity, temp, windSpeed, conditions });

  // === КРИТИЧЕСКИЕ АЛЕРТЫ (красные) ===
  
  // Экстремально высокое давление
  if (pressure >= HEALTH_THRESHOLDS.pressure.very_high && 
      (conditions.includes('hypertension') || conditions.includes('heart_disease'))) {
    alerts.push({
      id: 'critical_high_pressure',
      type: 'critical',
      icon: '🚨',
      title: 'КРИТИЧЕСКОЕ: Экстремально высокое давление',
      message: `${pressure} мм рт.ст. - опасно высокое!`,
      color: '#dc2626',
      bgColor: '#dc262615',
      priority: 1,
      conditions: ['hypertension', 'heart_disease'],
      advice: [
        '🚨 СРОЧНО измерьте артериальное давление',
        '💊 При необходимости примите лекарства',
        '🚶‍♂️ Ограничьте физическую активность',
        '📞 При ухудшении - вызовите врача'
      ]
    });
  }
  
  // Экстремально низкое давление
  if (pressure <= HEALTH_THRESHOLDS.pressure.very_low && 
      conditions.includes('hypotension')) {
    alerts.push({
      id: 'critical_low_pressure',
      type: 'critical',
      icon: '⚠️',
      title: 'КРИТИЧЕСКОЕ: Экстремально низкое давление',
      message: `${pressure} мм рт.ст. - риск обморока!`,
      color: '#dc2626',
      bgColor: '#dc262615',
      priority: 1,
      conditions: ['hypotension'],
      advice: [
        '☕ СРОЧНО выпейте кофе или сладкий чай',
        '🍫 Съешьте что-то сладкое',
        '🚫 Избегайте резких движений',
        '📞 При головокружении - вызовите помощь'
      ]
    });
  }

  // === ПРЕДУПРЕЖДАЮЩИЕ АЛЕРТЫ (оранжевые) ===
  
  // Анализ давления для гипертоников
  if (pressure >= HEALTH_THRESHOLDS.pressure.high && 
      conditions.includes('hypertension')) {
    alerts.push({
      id: 'high_pressure_warning',
      type: 'warning',
      icon: '📈',
      title: 'Повышенное атмосферное давление',
      message: `${pressure} мм рт.ст. - следите за самочувствием`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 2,
      conditions: ['hypertension'],
      advice: [
        '🩺 Измерьте артериальное давление утром',
        '🧂 Ограничьте соль в рационе',
        '🚶‍♀️ Легкие прогулки вместо интенсивных тренировок',
        '💧 Пейте больше воды'
      ]
    });
  }
  
  // Анализ давления для гипотоников
  if (pressure <= HEALTH_THRESHOLDS.pressure.low && 
      conditions.includes('hypotension')) {
    alerts.push({
      id: 'low_pressure_warning',
      type: 'warning',
      icon: '📉',
      title: 'Пониженное атмосферное давление',
      message: `${pressure} мм рт.ст. - возможна слабость`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 2,
      conditions: ['hypotension'],
      advice: [
        '☕ Выпейте кофе или зеленый чай',
        '🚿 Контрастный душ поможет взбодриться',
        '🏃‍♀️ Легкая зарядка улучшит тонус',
        '😴 Спите на высокой подушке'
      ]
    });
  }

  // Комплексный анализ для мигрени
  if (conditions.includes('migraine') || conditions.includes('meteoropathy')) {
    const migraineTriggers = [];
    
    if (pressure <= HEALTH_THRESHOLDS.pressure.low || 
        pressure >= HEALTH_THRESHOLDS.pressure.high) {
      migraineTriggers.push('перепады давления');
    }
    
    if (humidity >= HEALTH_THRESHOLDS.humidity.very_high) {
      migraineTriggers.push('высокая влажность');
    }
    
    if (windSpeed >= HEALTH_THRESHOLDS.wind.strong) {
      migraineTriggers.push('сильный ветер');
    }
    
    if (temp >= HEALTH_THRESHOLDS.temperature.hot || 
        temp <= HEALTH_THRESHOLDS.temperature.very_cold) {
      migraineTriggers.push('экстремальная температура');
    }
    
    if (migraineTriggers.length >= 2) {
      alerts.push({
        id: 'migraine_high_risk',
        type: 'warning',
        icon: '🤕',
        title: 'Высокий риск мигрени',
        message: `Несколько триггеров: ${migraineTriggers.join(', ')}`,
        color: '#8b5cf6',
        bgColor: '#8b5cf615',
        priority: 2,
        conditions: ['migraine', 'meteoropathy'],
        advice: [
          '💊 Подготовьте обезболивающие заранее',
          '😎 Носите солнцезащитные очки',
          '🧘‍♀️ Практикуйте релаксацию',
          '🚫 Избегайте стрессовых ситуаций'
        ]
      });
    } else if (migraineTriggers.length === 1) {
      alerts.push({
        id: 'migraine_moderate_risk',
        type: 'info',
        icon: '💡',
        title: 'Возможен дискомфорт',
        message: `Выявлен триггер: ${migraineTriggers[0]}`,
        color: '#6366f1',
        bgColor: '#6366f115',
        priority: 3,
        conditions: ['migraine', 'meteoropathy'],
        advice: [
          '💊 Имейте при себе лекарства',
          '💧 Пейте достаточно воды',
          '😴 Обеспечьте качественный сон'
        ]
      });
    }
  }

  // Анализ для астматиков
  if (conditions.includes('asthma')) {
    const asthmaRisks = [];
    
    if (humidity >= HEALTH_THRESHOLDS.humidity.very_high) {
      asthmaRisks.push('высокая влажность');
    }
    
    if (temp <= HEALTH_THRESHOLDS.temperature.cold) {
      asthmaRisks.push('холодный воздух');
    }
    
    if (windSpeed >= HEALTH_THRESHOLDS.wind.strong) {
      asthmaRisks.push('сильный ветер');
    }
    
    if (asthmaRisks.length > 0) {
      alerts.push({
        id: 'asthma_warning',
        type: 'warning',
        icon: '🫁',
        title: 'Неблагоприятно для дыхания',
        message: `Факторы риска: ${asthmaRisks.join(', ')}`,
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 2,
        conditions: ['asthma'],
        advice: [
          '💨 Имейте при себе ингалятор',
          '🏠 Ограничьте время на улице',
          '😷 Используйте защитную маску',
          '🌡️ Дышите через нос, не через рот'
        ]
      });
    }
  }

  // Анализ перепадов давления за последние 24 часа
  if (forecastData && forecastData.length > 0 && 
      (conditions.includes('meteoropathy') || conditions.includes('migraine'))) {
    
    const pressureChanges = analyzePressureChanges(forecastData, pressure);
    
    if (pressureChanges.maxChange >= 15) {
      alerts.push({
        id: 'pressure_fluctuation',
        type: 'warning',
        icon: '📊',
        title: 'Резкие перепады давления',
        message: `Изменение на ${pressureChanges.maxChange} мм рт.ст. за сутки`,
        color: '#6366f1',
        bgColor: '#6366f115',
        priority: 3,
        conditions: ['meteoropathy', 'migraine'],
        advice: [
          '⏰ Будьте готовы к изменению самочувствия',
          '💊 Подготовьте необходимые лекарства',
          '😴 Высыпайтесь перед изменением погоды',
          '🧘‍♀️ Практикуйте дыхательные техники'
        ]
      });
    }
  }

  // Получаем данные о магнитных бурях
  if (conditions.includes('meteoropathy')) {
    try {
      const spaceWeather = await getSpaceWeatherData();
      const magneticAlerts = analyzeMagneticActivity(spaceWeather, conditions);
      alerts.push(...magneticAlerts);
    } catch (error) {
      console.error('❌ Ошибка получения данных о магнитных бурях:', error);
    }
  }
  
  // Сортируем алерты по приоритету
  return alerts.sort((a, b) => a.priority - b.priority);
}

// Анализ магнитной активности
function analyzeMagneticActivity(spaceWeather, conditions) {
  if (!spaceWeather?.kp_index || !conditions.includes('meteoropathy')) {
    return [];
  }
  
  const alerts = [];
  const kp = spaceWeather.kp_index;
  
  // Сильная магнитная буря
  if (kp.current_kp >= HEALTH_THRESHOLDS.kp_index.storm) {
    alerts.push({
      id: 'magnetic_storm_severe',
      type: 'warning',
      icon: '🌌',
      title: 'Сильная магнитная буря',
      message: `Геомагнитная активность: ${getActivityLevelRu(kp.activity_level)} (Kp=${kp.current_kp})`,
      color: '#7c3aed',
      bgColor: '#7c3aed15',
      priority: 2,
      conditions: ['meteoropathy'],
      advice: [
        '😴 Увеличьте продолжительность сна на 1-2 часа',
        '💧 Пейте больше воды (до 2.5л в день)',
        '🧘‍♀️ Практикуйте медитацию и релаксацию',
        '📱 Ограничьте использование гаджетов',
        '🚫 Избегайте стрессовых ситуаций'
      ]
    });
  }
  // Умеренная активность
  else if (kp.current_kp >= HEALTH_THRESHOLDS.kp_index.active) {
    alerts.push({
      id: 'magnetic_activity_moderate',
      type: 'info',
      icon: '🌠',
      title: 'Повышенная геомагнитная активность',
      message: `${getActivityLevelRu(kp.activity_level)} (Kp=${kp.current_kp})`,
      color: '#6366f1',
      bgColor: '#6366f115',
      priority: 3,
      conditions: ['meteoropathy'],
      advice: [
        '😴 Обеспечьте качественный сон',
        '🚶‍♀️ Больше времени проводите на свежем воздухе',
        '🥗 Легкое питание, избегайте тяжелой пищи',
        '💡 При головной боли - отдохните в тишине'
      ]
    });
  }
  
  return alerts;
}

// Анализ изменений давления
function analyzePressureChanges(forecastData, currentPressure) {
  if (!forecastData || forecastData.length === 0) {
    return { maxChange: 0, trend: 'stable' };
  }
  
  const pressureValues = [currentPressure];
  
  // Извлекаем давление из прогноза
  forecastData.forEach(item => {
    if (item.details?.pressure) {
      pressureValues.push(item.details.pressure);
    }
  });
  
  if (pressureValues.length < 2) {
    return { maxChange: 0, trend: 'stable' };
  }
  
  const minPressure = Math.min(...pressureValues);
  const maxPressure = Math.max(...pressureValues);
  const maxChange = Math.round(maxPressure - minPressure);
  
  // Определяем общий тренд
  const first = pressureValues[0];
  const last = pressureValues[pressureValues.length - 1];
  const trend = last > first + 5 ? 'rising' : 
                last < first - 5 ? 'falling' : 'stable';
  
  return { maxChange, trend, minPressure, maxPressure };
}

// Функция для получения рекомендаций по времени дня
export function getTimeBasedHealthAdvice(conditions, currentHour) {
  const advice = [];
  
  // Утренние рекомендации для метеозависимых
  if (conditions.includes('meteoropathy') && currentHour >= 6 && currentHour <= 10) {
    advice.push({
      time: 'morning',
      icon: '🌅',
      text: 'Утром медленно вставайте с кровати, измерьте давление'
    });
  }
  
  // Вечерние рекомендации
  if (conditions.includes('hypertension') && currentHour >= 18 && currentHour <= 22) {
    advice.push({
      time: 'evening',
      icon: '🌆',
      text: 'Вечером избегайте соленой пищи и кофеина'
    });
  }
  
  return advice;
}

// Экспорт устаревших функций для совместимости с существующим кодом
export async function getMagneticStormData() {
  const spaceWeather = await getSpaceWeatherData();
  return spaceWeather?.kp_index || null;
}

export function analyzeMagneticStorms(stormData, userProfile) {
  if (!stormData || !userProfile?.health?.includes('meteosensitive')) {
    return [];
  }
  
  return analyzeMagneticActivity({ kp_index: stormData }, ['meteoropathy']);
}