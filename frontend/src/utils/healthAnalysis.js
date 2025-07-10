// 🏥 healthAnalysis.js - ПОЛНОСТЬЮ УНИФИЦИРОВАННАЯ система анализа здоровья

// Медицинские пороги для различных состояний
const HEALTH_THRESHOLDS = {
  pressure: {
    very_low: 735,
    low: 745,
    normal_low: 750,
    normal_high: 760,  // ✅ Должно быть 760, не 765
    high: 765,         // ✅ Должно быть 765, не 770  
    very_high: 775     // ✅ Должно быть 775, не 780
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

// Подключение реального API магнитных бурь
async function getSpaceWeatherData() {
  try {
    console.log('🌌 Получаем реальные данные космической погоды...');
    
    // Динамический импорт реального API
    const { getCompleteSpaceWeather } = await import('../spaceWeather.js');
    const spaceWeatherData = await getCompleteSpaceWeather();
    
    if (spaceWeatherData && spaceWeatherData.kp_index) {
      console.log('✅ Данные космической погоды получены:', spaceWeatherData.kp_index);
      return spaceWeatherData;
    }
    
    // Fallback на заглушку только если API недоступен
    console.warn('⚠️ API недоступен, используем fallback данные');
    return {
      kp_index: {
        current_kp: 2.5,
        activity_level: 'quiet',
        trend: 'stable'
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка получения космической погоды:', error);
    return {
      kp_index: {
        current_kp: 2.0,
        activity_level: 'quiet', 
        trend: 'stable'
      }
    };
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

// УНИФИЦИРОВАННАЯ функция маппинга состояний здоровья
function mapHealthConditions(userProfile) {
  const conditions = [];
  
  // ЗАЩИТА ОТ UNDEFINED
  if (!userProfile) {
    console.log('⚠️ Профиль пользователя не определен');
    return conditions;
  }

  // Поддерживаем оба поля для совместимости
  let healthArray = [];
  if (userProfile.health && Array.isArray(userProfile.health)) {
    healthArray = userProfile.health;
  } else if (userProfile.medicalConditions && Array.isArray(userProfile.medicalConditions)) {
    healthArray = userProfile.medicalConditions;
  } else {
    console.log('⚠️ Не найдены данные о здоровье:', userProfile);
    return conditions;
  }

  healthArray.forEach(condition => {
    switch (condition) {
      case 'meteosensitive':
      case 'meteoropathy':
        conditions.push('meteoropathy', 'migraine');
        break;
      case 'pressure':
      case 'hypertension':
      case 'cardiovascular':
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
        conditions.push('allergies', 'respiratory');
        break;
      case 'arthritis':
        conditions.push('arthritis', 'joints');
        break;
    }
  });
  
  return [...new Set(conditions)]; // Убираем дубликаты
}

// Анализ изменений давления с улучшенной валидацией
function analyzePressureChanges(forecastData, currentPressure) {
  if (!forecastData || !Array.isArray(forecastData) || forecastData.length < 2) {
    return { maxChange: 0, trend: 'stable', periods: [] };
  }
  
  const changes = [];
  let maxChange = 0;
  
  // Анализируем изменения за последние 24 часа
  for (let i = 1; i < Math.min(forecastData.length, 8); i++) {
    const prev = forecastData[i - 1];
    const curr = forecastData[i];
    
    if (prev?.main?.pressure && curr?.main?.pressure) {
      const change = Math.abs(curr.main.pressure - prev.main.pressure);
      changes.push(change);
      maxChange = Math.max(maxChange, change);
    }
  }
  
  // Добавляем изменение от текущего давления к первому прогнозу
  if (currentPressure && forecastData[0]?.main?.pressure) {
    const change = Math.abs(forecastData[0].main.pressure - currentPressure);
    maxChange = Math.max(maxChange, change);
  }
  
  const avgChange = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
  
  let trend = 'stable';
  if (avgChange > 8) trend = 'volatile';
  else if (avgChange > 4) trend = 'changing';
  
  return {
    maxChange: Math.round(maxChange),
    avgChange: Math.round(avgChange),
    trend,
    periods: changes.length
  };
}

// Анализ магнитной активности с детальной обработкой
function analyzeMagneticActivity(spaceWeather, conditions) {
  if (!spaceWeather?.kp_index || !conditions.includes('meteoropathy')) {
    return [];
  }
  
  const alerts = [];
  const kp = spaceWeather.kp_index;
  const currentKp = kp.current_kp || 0;
  
  console.log(`🌌 Анализ магнитной активности: Kp=${currentKp}, уровень=${kp.activity_level}`);
  
  // Экстремальная буря (Kp >= 7)
  if (currentKp >= HEALTH_THRESHOLDS.kp_index.storm) {
    alerts.push({
      id: 'magnetic_storm_severe',
      type: 'critical',
      icon: '🌌',
      title: 'Сильная магнитная буря',
      message: `Экстремальная геомагнитная активность (Kp=${currentKp.toFixed(1)})`,
      color: '#dc2626',
      bgColor: '#dc262615',
      priority: 1,
      conditions: ['meteoropathy'],
      advice: [
        '🚨 Максимально ограничьте физические нагрузки',
        '😴 Увеличьте продолжительность сна на 2-3 часа',
        '💧 Пейте много воды (до 3л в день)',
        '💊 Держите лекарства под рукой',
        '🧘‍♀️ Практикуйте глубокое дыхание и медитацию',
        '📱 Минимизируйте использование электроники'
      ]
    });
  }
  // Умеренная буря (Kp 5-6)
  else if (currentKp >= HEALTH_THRESHOLDS.kp_index.active) {
    alerts.push({
      id: 'magnetic_storm_moderate',
      type: 'warning',
      icon: '🌠',
      title: 'Магнитная буря',
      message: `Повышенная геомагнитная активность (Kp=${currentKp.toFixed(1)})`,
      color: '#7c3aed',
      bgColor: '#7c3aed15',
      priority: 2,
      conditions: ['meteoropathy'],
      advice: [
        '😴 Увеличьте продолжительность сна на 1-2 часа',
        '💧 Пейте больше воды (до 2.5л в день)',
        '🧘‍♀️ Практикуйте релаксацию',
        '🚫 Избегайте стрессовых ситуаций',
        '🌿 Больше времени проводите на природе'
      ]
    });
  }
  // Слабая активность (Kp 4-5)
  else if (currentKp >= HEALTH_THRESHOLDS.kp_index.unsettled) {
    alerts.push({
      id: 'magnetic_activity_mild',
      type: 'info',
      icon: '🌙',
      title: 'Умеренная геомагнитная активность',
      message: `Небольшие возмущения (Kp=${currentKp.toFixed(1)})`,
      color: '#6366f1',
      bgColor: '#6366f115',
      priority: 3,
      conditions: ['meteoropathy'],
      advice: [
        '💧 Следите за водным балансом',
        '😴 Обеспечьте качественный сон',
        '🧘‍♀️ Практикуйте дыхательные упражнения'
      ]
    });
  }
  
  return alerts;
}

// ОСНОВНАЯ ФУНКЦИЯ АНАЛИЗА ЗДОРОВЬЯ - ПОЛНОСТЬЮ УНИФИЦИРОВАННАЯ
export async function analyzeHealthRisks(weather, userProfile, forecastData = null) {
  console.log('🏥 Начинаем анализ рисков для здоровья...');
  
  // КОМПЛЕКСНАЯ ЗАЩИТА ОТ UNDEFINED
  if (!weather) {
    console.log('⚠️ Нет данных о погоде');
    return [];
  }
  
  if (!userProfile) {
    console.log('⚠️ Нет профиля пользователя');
    return [];
  }
  
  // Проверяем наличие данных о здоровье в любом из полей
  const hasHealthData = (userProfile.health && Array.isArray(userProfile.health) && userProfile.health.length > 0) ||
                       (userProfile.medicalConditions && Array.isArray(userProfile.medicalConditions) && userProfile.medicalConditions.length > 0);

  if (!hasHealthData) {
    console.log('⚠️ Не указаны проблемы со здоровьем');
    return [];
  }
  
  const alerts = [];
  const conditions = mapHealthConditions(userProfile);
  
  if (conditions.length === 0) {
    console.log('ℹ️ Пользователь не указал проблем со здоровьем');
    return [];
  }
  
  console.log('📋 Анализируемые состояния:', conditions);
  
  // УНИФИЦИРОВАННОЕ извлечение данных о погоде
  const temp = weather.temp || weather.temperature || 20;
  const pressure = weather.pressure || weather.details?.pressure || 760;
  const humidity = weather.humidity || weather.details?.humidity || 50;
  const windSpeed = weather.wind_speed || 
                   (weather.details?.wind ? parseFloat(weather.details.wind.replace(' м/с', '')) : 0) || 0;
  const weatherDesc = weather.weather || weather.description || [];

  // Анализ атмосферного давления
  if (pressure && (conditions.includes('hypertension') || conditions.includes('hypotension') || conditions.includes('meteoropathy'))) {
    if (pressure <= HEALTH_THRESHOLDS.pressure.very_low) {
      alerts.push({
        id: 'pressure_very_low',
        type: 'critical',
        icon: '📉',
        title: 'Критически низкое давление',
        message: `${Math.round(pressure)} мм рт.ст. - опасно для гипотоников`,
        color: '#dc2626',
        bgColor: '#dc262615',
        priority: 1,
        conditions: ['hypotension', 'meteoropathy'],
        advice: [
          '☕ Выпейте крепкий кофе или чай',
          '🧂 Немного подсоленной воды поможет',
          '🚫 Избегайте резких движений',
          '💊 Имейте под рукой тонизирующие препараты',
          '🛏️ При плохом самочувствии - постельный режим'
        ]
      });
    } else if (pressure <= HEALTH_THRESHOLDS.pressure.low) {
      alerts.push({
        id: 'pressure_low',
        type: 'warning',
        icon: '📉',
        title: 'Низкое атмосферное давление',
        message: `${Math.round(pressure)} мм рт.ст. - возможна слабость`,
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        priority: 2,
        conditions: ['hypotension', 'meteoropathy'],
        advice: [
          '☕ Утренний кофе обязателен',
          '💧 Пейте больше жидкости',
          '🚶‍♀️ Легкая физическая активность поможет',
          '😴 Высыпайтесь (8+ часов сна)'
        ]
      });
    } else if (pressure >= HEALTH_THRESHOLDS.pressure.very_high) {
      alerts.push({
        id: 'pressure_very_high',
        type: 'critical',
        icon: '📈',
        title: 'Критически высокое давление',
        message: `${Math.round(pressure)} мм рт.ст. - опасно для гипертоников`,
        color: '#dc2626',
        bgColor: '#dc262615',
        priority: 1,
        conditions: ['hypertension', 'heart_disease'],
        advice: [
          '💊 Примите назначенные препараты',
          '🧘‍♀️ Глубокое дыхание и релаксация',
          '🚫 Исключите физические нагрузки',
          '💧 Ограничьте потребление соли',
          '📞 При плохом самочувствии - вызов врача'
        ]
      });
    } else if (pressure >= HEALTH_THRESHOLDS.pressure.high) {
      alerts.push({
        id: 'pressure_high',
        type: 'warning',
        icon: '📈',
        title: 'Высокое атмосферное давление',
        message: `${Math.round(pressure)} мм рт.ст. - контролируйте АД`,
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        priority: 2,
        conditions: ['hypertension', 'heart_disease'],
        advice: [
          '💊 Контролируйте прием лекарств',
          '🧘‍♀️ Избегайте стрессов',
          '🚶‍♀️ Только легкие прогулки',
          '💧 Пейте травяные чаи'
        ]
      });
    }
  }

  // Анализ для метеозависимых и склонных к мигрени
  if (conditions.includes('migraine') || conditions.includes('meteoropathy')) {
    const migraineTriggers = [];
    
    if (humidity >= HEALTH_THRESHOLDS.humidity.very_high) {
      migraineTriggers.push('высокая влажность');
    }
    
    if (windSpeed >= HEALTH_THRESHOLDS.wind.strong) {
      migraineTriggers.push('сильный ветер');
    }
    
    if (temp >= HEALTH_THRESHOLDS.temperature.very_hot) {
      migraineTriggers.push('сильная жара');
    }
    
    if (Array.isArray(weatherDesc) && weatherDesc.length > 0 && 
        weatherDesc.some(desc => desc.main && desc.main.includes('Rain'))) {
      migraineTriggers.push('дождь');
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
          '🚫 Избегайте стрессовых ситуаций',
          '🌙 Приглушите яркий свет дома'
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

  // Анализ перепадов давления с улучшенной валидацией
  if (forecastData && Array.isArray(forecastData) && forecastData.length > 0 && 
      (conditions.includes('meteoropathy') || conditions.includes('migraine'))) {
    
    const pressureChanges = analyzePressureChanges(forecastData, pressure);
    
    if (pressureChanges.maxChange >= 15) {
      alerts.push({
        id: 'pressure_fluctuation_severe',
        type: 'warning',
        icon: '📊',
        title: 'Резкие перепады давления',
        message: `Изменение на ${pressureChanges.maxChange} мм рт.ст. за сутки`,
        color: '#dc2626',
        bgColor: '#dc262615',
        priority: 1,
        conditions: ['meteoropathy', 'migraine'],
        advice: [
          '💊 Подготовьте необходимые лекарства',
          '😴 Высыпайтесь перед изменением погоды',
          '🧘‍♀️ Практикуйте дыхательные техники',
          '🚫 Избегайте стрессов и переутомления'
        ]
      });
    } else if (pressureChanges.maxChange >= 8) {
      alerts.push({
        id: 'pressure_fluctuation_moderate',
        type: 'info',
        icon: '📈',
        title: 'Умеренные изменения давления',
        message: `Изменение на ${pressureChanges.maxChange} мм рт.ст. за сутки`,
        color: '#6366f1',
        bgColor: '#6366f115',
        priority: 3,
        conditions: ['meteoropathy', 'migraine'],
        advice: [
          '⏰ Будьте готовы к изменению самочувствия',
          '💧 Пейте достаточно воды',
          '😴 Обеспечьте качественный сон'
        ]
      });
    }
  }

  // Получаем РЕАЛЬНЫЕ данные о магнитных бурях
  if (conditions.includes('meteoropathy')) {
    try {
      console.log('🌌 Получаем данные о магнитных бурях...');
      const spaceWeather = await getSpaceWeatherData();
      const magneticAlerts = analyzeMagneticActivity(spaceWeather, conditions);
      alerts.push(...magneticAlerts);
      console.log(`🌌 Добавлено ${magneticAlerts.length} магнитных алертов`);
    } catch (error) {
      console.error('❌ Ошибка получения данных о магнитных бурях:', error);
    }
  }
  
  // Сортируем алерты по приоритету и убираем дубликаты
  const uniqueAlerts = alerts.filter((alert, index, self) => 
    index === self.findIndex(a => a.id === alert.id)
  );
  
  const sortedAlerts = uniqueAlerts.sort((a, b) => a.priority - b.priority);
  
  console.log(`✅ Анализ завершен. Найдено ${sortedAlerts.length} рисков для здоровья`);
  
  return sortedAlerts;
}

// ДОБАВЛЯЕМ ФУНКЦИЮ-АЛИАС ДЛЯ СОВМЕСТИМОСТИ
export async function analyzeWeatherForHealth(weather, userProfile, forecast) {
  console.log('🔗 Вызов analyzeWeatherForHealth (алиас для analyzeHealthRisks)');
  return await analyzeHealthRisks(weather, userProfile, forecast);
}

// Экспорт для тестирования и использования в других компонентах
export { 
  mapHealthConditions, 
  analyzePressureChanges, 
  analyzeMagneticActivity,
  HEALTH_THRESHOLDS,
  getSpaceWeatherData,
  getActivityLevelRu
};