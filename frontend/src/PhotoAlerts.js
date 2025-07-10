// PhotoAlerts.js - Умные алерты для фотографов природы
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Анализ условий для фотографии
function analyzePhotoConditions(weather, userProfile, forecastData, uvData, astronomyData) {
  if (!weather || !userProfile || !userProfile.interests) return [];
  
  // Проверяем есть ли интерес к фотографии
  const hasPhotography = userProfile.interests.some(interest => 
    interest.includes('фотография') || 
    interest.includes('фото') || 
    interest.includes('photography') ||
    interest.includes('природа')
  );
  
  if (!hasPhotography) return [];
  
  const alerts = [];
  const temp = Math.round(weather.main.temp);
  const humidity = weather.main.humidity;
  const windSpeed = Math.round(weather.wind?.speed * 3.6) || 0;
  const clouds = weather.clouds?.all || 0;
  const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 10;
  const uvIndex = uvData?.uvi || 0;
  
  const now = new Date();
  const sunrise = astronomyData?.sunrise ? new Date(astronomyData.sunrise * 1000) : null;
  const sunset = astronomyData?.sunset ? new Date(astronomyData.sunset * 1000) : null;
  
  // 📸 ЗОЛОТОЙ ЧАС
  if (sunrise && sunset) {
    const goldenHourMorning = new Date(sunrise.getTime() + 30 * 60000); // 30 мин после восхода
    const goldenHourEvening = new Date(sunset.getTime() - 30 * 60000); // 30 мин до заката
    
    const timeToMorningGolden = goldenHourMorning.getTime() - now.getTime();
    const timeToEveningGolden = goldenHourEvening.getTime() - now.getTime();
    
    // Утренний золотой час
    if (timeToMorningGolden > 0 && timeToMorningGolden < 3600000) { // В течение часа
      const minutesLeft = Math.round(timeToMorningGolden / 60000);
      alerts.push({
        id: 'golden_hour_morning',
        type: 'excellent',
        icon: '🌅',
        title: 'Золотой час близко!',
        message: `Через ${minutesLeft}мин - идеальный свет`,
        color: '#f59e0b',
        bgColor: '#f59e0b20',
        priority: 15,
        advice: [
          'Подготовьте камеру и объективы',
          'Найдите интересную композицию',
          'Проверьте уровень заряда батареи'
        ]
      });
    }
    
    // Вечерний золотой час
    if (timeToEveningGolden > 0 && timeToEveningGolden < 3600000) {
      const minutesLeft = Math.round(timeToEveningGolden / 60000);
      alerts.push({
        id: 'golden_hour_evening',
        type: 'excellent',
        icon: '🌇',
        title: 'Вечерний золотой час',
        message: `Через ${minutesLeft}мин - волшебное освещение`,
        color: '#f59e0b',
        bgColor: '#f59e0b20',
        priority: 15,
        advice: [
          'Ищите силуэты и контражур',
          'Снимайте портреты в мягком свете',
          'Пейзажи будут особенно красивы'
        ]
      });
    }
  }
  
  // 🌙 СИНИЙ ЧАС
  if (sunset) {
    const blueHourStart = new Date(sunset.getTime() + 15 * 60000); // 15 мин после заката
    const timeToBlueHour = blueHourStart.getTime() - now.getTime();
    
    if (timeToBlueHour > 0 && timeToBlueHour < 1800000) { // В течение 30 мин
      const minutesLeft = Math.round(timeToBlueHour / 60000);
      alerts.push({
        id: 'blue_hour',
        type: 'excellent',
        icon: '🌆',
        title: 'Синий час приближается',
        message: `Через ${minutesLeft}мин - мистическое освещение`,
        color: '#3b82f6',
        bgColor: '#3b82f620',
        priority: 14,
        advice: [
          'Включите освещение в кадре',
          'Используйте штатив',
          'Снимайте городские пейзажи'
        ]
      });
    }
  }
  
  // ☁️ ОБЛАЧНОСТЬ ДЛЯ ДРАМАТИЧНОСТИ
  if (clouds >= 30 && clouds <= 70 && windSpeed < 20) {
    alerts.push({
      id: 'dramatic_clouds',
      type: 'excellent',
      icon: '☁️',
      title: 'Драматичные облака',
      message: `${clouds}% облачности - идеально для пейзажей`,
      color: '#6b7280',
      bgColor: '#6b728020',
      priority: 12,
      advice: [
        'Снимайте широкоугольным объективом',
        'Используйте поляризационный фильтр',
        'Ищите игру света в облаках'
      ]
    });
  }
  
  // 🌧️ ПОСЛЕ ДОЖДЯ
  const recentRain = weather.rain?.['1h'] || 0;
  if (recentRain > 0 && recentRain < 2 && clouds < 80) {
    alerts.push({
      id: 'after_rain',
      type: 'excellent',
      icon: '🌈',
      title: 'После дождичка',
      message: 'Чистый воздух и возможные радуги!',
      color: '#10b981',
      bgColor: '#10b98120',
      priority: 13,
      advice: [
        'Ищите радуги на востоке',
        'Капли на листьях - макросъёмка',
        'Отражения в лужах'
      ]
    });
  }
  
  // ❄️ СНЕГ
  const snow = weather.snow?.['1h'] || 0;
  if (snow > 0 && snow < 5 && windSpeed < 15) {
    alerts.push({
      id: 'gentle_snow',
      type: 'excellent',
      icon: '❄️',
      title: 'Мягкий снегопад',
      message: 'Сказочная атмосфера для съёмки',
      color: '#06b6d4',
      bgColor: '#06b6d420',
      priority: 13,
      advice: [
        'Защитите камеру от влаги',
        'Снимайте крупные хлопья',
        'Ищите контраст с тёмным фоном'
      ]
    });
  }
  
  // 🌫️ ТУМАН
  if (humidity > 90 && visibility < 3 && windSpeed < 10) {
    alerts.push({
      id: 'mystical_fog',
      type: 'excellent',
      icon: '🌫️',
      title: 'Мистический туман',
      message: `Видимость ${visibility}км - атмосферные кадры`,
      color: '#8b5cf6',
      bgColor: '#8b5cf620',
      priority: 14,
      advice: [
        'Снимайте силуэты в тумане',
        'Используйте длиннофокусный объектив',
        'Ищите лучи света'
      ]
    });
  }
  
  // ☀️ ЯРКОЕ СОЛНЦЕ - хорошо и плохо
  if (clouds < 20 && uvIndex > 7) {
    alerts.push({
      id: 'bright_sun_caution',
      type: 'warning',
      icon: '☀️',
      title: 'Яркое солнце',
      message: 'Резкие тени, высокий контраст',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 8,
      advice: [
        'Используйте рефлектор для теней',
        'Снимайте в тени или с фильтром',
        'Ищите интересные тени'
      ]
    });
  }
  
  // 💨 СИЛЬНЫЙ ВЕТЕР
  if (windSpeed > 25) {
    alerts.push({
      id: 'windy_conditions',
      type: 'warning',
      icon: '💨',
      title: 'Сильный ветер',
      message: `${windSpeed} км/ч - сложно для штатива`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 9,
      advice: [
        'Утяжелите штатив',
        'Снимайте движение ветра',
        'Укройте камеру от пыли'
      ]
    });
  }
  
  // 🥶 ХОЛОД
  if (temp < -10) {
    alerts.push({
      id: 'extreme_cold',
      type: 'warning',
      icon: '🥶',
      title: 'Экстремальный холод',
      message: `${temp}°C - берегите технику`,
      color: '#ef4444',
      bgColor: '#ef444415',
      priority: 11,
      advice: [
        'Держите батареи в тепле',
        'Избегайте резких перепадов температур',
        'Дайте камере акклиматизироваться'
      ]
    });
  }
  
  // 🔍 АНАЛИЗ ЛУЧШЕГО ВРЕМЕНИ ДЛЯ СЪЁМКИ
  if (forecastData && forecastData.length > 0) {
    let bestTime = null;
    let bestScore = 0;
    
    forecastData.slice(0, 8).forEach((item, index) => { // Ближайшие 24 часа
      const itemTime = new Date(item.dt * 1000);
      const itemClouds = item.clouds?.all || 0;
      const itemWind = Math.round(item.wind?.speed * 3.6) || 0;
      const itemTemp = Math.round(item.main.temp);
      
      // Вычисляем оценку условий для фотосъёмки
      let score = 0;
      
      // Облачность (30-70% лучше всего)
      if (itemClouds >= 30 && itemClouds <= 70) score += 40;
      else if (itemClouds < 30) score += 20;
      
      // Ветер (меньше лучше)
      if (itemWind < 15) score += 30;
      else if (itemWind < 25) score += 15;
      
      // Температура (комфорт фотографа)
      if (itemTemp >= 0 && itemTemp <= 25) score += 20;
      else if (itemTemp >= -5 && itemTemp <= 30) score += 10;
      
      // Проверяем близость к золотому часу
      if (sunset && sunrise) {
        const itemHour = itemTime.getHours();
        const sunriseHour = sunrise.getHours();
        const sunsetHour = sunset.getHours();
        
        if (Math.abs(itemHour - sunriseHour) <= 1 || Math.abs(itemHour - sunsetHour) <= 1) {
          score += 50; // Бонус за золотой час
        }
      }
      
      if (score > bestScore && itemTime > now) {
        bestScore = score;
        const timeDiffMs = itemTime.getTime() - now.getTime();
        const hoursDiff = Math.round(timeDiffMs / (1000 * 60 * 60));
        
        bestTime = {
          time: itemTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          hoursDiff,
          clouds: itemClouds,
          wind: itemWind,
          temp: itemTemp
        };
      }
    });
    
    if (bestTime && bestScore > 60) {
      let timeMessage;
      if (bestTime.hoursDiff <= 1) {
        timeMessage = `в ${bestTime.time}`;
      } else {
        timeMessage = `через ${bestTime.hoursDiff}ч в ${bestTime.time}`;
      }
      
      alerts.push({
        id: 'best_photo_time',
        type: 'prediction',
        icon: '📷',
        title: `Лучшее время ${timeMessage}`,
        message: `${bestTime.temp}°C, облачность ${bestTime.clouds}%`,
        color: '#8b5cf6',
        bgColor: '#8b5cf615',
        priority: 7,
        advice: [
          'Запланируйте фотосессию',
          'Проверьте локации заранее',
          'Подготовьте оборудование'
        ]
      });
    }
  }
  
  // 🌟 АСТРОФОТОГРАФИЯ (ночное время)
  if (now.getHours() >= 22 || now.getHours() <= 5) {
    if (clouds < 30 && humidity < 80) {
      alerts.push({
        id: 'astrophotography',
        type: 'excellent',
        icon: '🌟',
        title: 'Ясное небо для звёзд',
        message: `${clouds}% облачности - видны звёзды`,
        color: '#1e293b',
        bgColor: '#1e293b20',
        priority: 13,
        advice: [
          'Ищите места без засветки',
          'Используйте широкоугольный объектив',
          'Штатив обязателен'
        ]
      });
    }
  }
  
  // Сортируем по приоритету
  return alerts.sort((a, b) => b.priority - a.priority);
}

// Функция получения цветовой темы
function getPhotoTheme(alerts) {
  const excellentAlerts = alerts.filter(alert => alert.type === 'excellent').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (excellentAlerts > 0) {
    return {
      mainColor: '#8b5cf6',
      bgColor: '#8b5cf615',
      iconBgColor: '#8b5cf610'
    };
  } else if (warningAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#6b7280',
      bgColor: '#6b728015',
      iconBgColor: '#6b728010'
    };
  }
}

// SVG иконка стрелки
const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    style={{ color: "#6b7280" }}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

export default function PhotoAlerts({ weather, userProfile, forecastData, uvData, astronomyData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzePhotoConditions(weather, userProfile, forecastData, uvData, astronomyData);
  const theme = getPhotoTheme(alerts);
  
  // Если нет профиля или интереса к фотографии
  if (!userProfile || !userProfile.interests) {
    return null;
  }
  
  const hasPhotography = userProfile.interests.some(interest => 
    interest.includes('фотография') || 
    interest.includes('фото') || 
    interest.includes('photography') ||
    interest.includes('природа')
  );
  
  if (!hasPhotography) {
    return null;
  }
  
  // Если нет алертов - показываем нейтральное сообщение
  if (alerts.length === 0) {
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: 16,
        margin: "16px auto 0",
        maxWidth: 340,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 16, color: '#6b7280' }}>
          📷 Фотография
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Анализируем освещение...
        </div>
      </div>
    );
  }
  
  // Главный алерт для превью
  const mainAlert = alerts[0];
  const excellentCount = alerts.filter(alert => alert.type === 'excellent').length;
  
  return (
    <motion.div
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: 16,
        padding: "10px",
        margin: "16px auto 0",
        maxWidth: 340,
        width: "100%",
        boxSizing: "border-box",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        cursor: "pointer",
        border: excellentCount > 0 
          ? `2px solid ${theme.mainColor}40` 
          : "1px solid rgba(255,255,255,0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Заголовок с превью */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Левая часть */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1
        }}>
          {/* Иконка с анимацией */}
          <motion.div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.iconBgColor}, ${theme.bgColor})`,
              border: `1px solid ${theme.mainColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 18
            }}
            animate={excellentCount > 0 ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 0 8px rgba(139, 92, 246, 0.1)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: excellentCount > 0 ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            {mainAlert.icon}
          </motion.div>

          {/* Текст */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.2',
              marginBottom: 2
            }}>
              📷 {mainAlert.title}
            </div>
            <div style={{
              fontSize: 12,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.3'
            }}>
              {mainAlert.message}
            </div>
            {alerts.length > 1 && (
              <div style={{
                fontSize: 10,
                color: theme.mainColor,
                fontFamily: 'Montserrat, Arial, sans-serif',
                marginTop: 2,
                fontWeight: 500
              }}>
                +{alerts.length - 1} совет{alerts.length - 1 === 1 ? '' : alerts.length - 1 < 5 ? 'а' : 'ов'}
              </div>
            )}
          </div>
        </div>

        {/* Стрелка */}
        <ChevronIcon isOpen={isExpanded} />
      </div>

      {/* Развернутый контент */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.1)"
          }}
        >
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                background: alert.bgColor,
                borderRadius: 12,
                padding: 12,
                marginBottom: index < alerts.length - 1 ? 8 : 0,
                border: `1px solid ${alert.color}20`
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6
              }}>
                <span style={{ fontSize: 16 }}>{alert.icon}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: alert.color,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  {alert.title}
                </span>
              </div>
              
              <div style={{
                fontSize: 12,
                color: '#4b5563',
                fontFamily: 'Montserrat, Arial, sans-serif',
                marginBottom: 8,
                lineHeight: '1.4'
              }}>
                {alert.message}
              </div>
              
              {alert.advice && (
                <div style={{
                  fontSize: 11,
                  color: '#6b7280',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Советы:</div>
                  {alert.advice.map((tip, tipIndex) => (
                    <div key={tipIndex} style={{ marginBottom: 2 }}>
                      • {tip}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}