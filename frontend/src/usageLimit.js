// Система управления лимитами для Freemium пользователей

const DAILY_LIMIT = 5; // Freemium лимит: 5 запросов в день
const PREMIUM_DAILY_LIMIT = 999; // Premium: практически безлимит

// Получить текущую дату в формате YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Получить данные об использовании
export const getUsageData = () => {
  try {
    const data = localStorage.getItem('weatherUsage');
    return data ? JSON.parse(data) : { date: getCurrentDate(), count: 0, isPremium: false };
  } catch (error) {
    return { date: getCurrentDate(), count: 0, isPremium: false };
  }
};

// Сохранить данные об использовании
const saveUsageData = (data) => {
  try {
    localStorage.setItem('weatherUsage', JSON.stringify(data));
  } catch (error) {
    console.error('Не удалось сохранить данные использования:', error);
  }
};

// Проверить можно ли сделать запрос
export const canMakeRequest = () => {
  const usage = getUsageData();
  const currentDate = getCurrentDate();
  
  // Если новый день - сбрасываем счетчик
  if (usage.date !== currentDate) {
    const newUsage = { 
      date: currentDate, 
      count: 0, 
      isPremium: usage.isPremium 
    };
    saveUsageData(newUsage);
    return { canMake: true, remaining: usage.isPremium ? PREMIUM_DAILY_LIMIT : DAILY_LIMIT };
  }
  
  const limit = usage.isPremium ? PREMIUM_DAILY_LIMIT : DAILY_LIMIT;
  const remaining = Math.max(0, limit - usage.count);
  
  return { 
    canMake: usage.count < limit, 
    remaining,
    isPremium: usage.isPremium 
  };
};

// Зарегистрировать запрос
export const recordRequest = () => {
  const usage = getUsageData();
  const currentDate = getCurrentDate();
  
  if (usage.date !== currentDate) {
    // Новый день
    saveUsageData({ 
      date: currentDate, 
      count: 1, 
      isPremium: usage.isPremium 
    });
  } else {
    // Увеличиваем счетчик
    saveUsageData({ 
      ...usage, 
      count: usage.count + 1 
    });
  }
};

// Активировать Premium
export const activatePremium = () => {
  const usage = getUsageData();
  saveUsageData({ 
    ...usage, 
    isPremium: true 
  });
};

// Получить статистику для отображения
export const getUsageStats = () => {
  const usage = getUsageData();
  const { canMake, remaining, isPremium } = canMakeRequest();
  
  return {
    used: usage.count,
    remaining,
    limit: isPremium ? PREMIUM_DAILY_LIMIT : DAILY_LIMIT,
    isPremium,
    canMakeRequest: canMake,
    percentage: Math.min(100, (usage.count / (isPremium ? PREMIUM_DAILY_LIMIT : DAILY_LIMIT)) * 100)
  };
};