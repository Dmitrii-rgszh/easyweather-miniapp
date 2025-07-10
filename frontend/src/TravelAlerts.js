// TravelAlerts.js - Умные алерты для путешественников
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Анализ условий для путешествий
function analyzeTravelConditions(weather, userProfile, forecastData, uvData) {
  if (!weather || !userProfile || !userProfile.interests) return [];
  
  // Проверяем есть ли интерес к путешествиям
  const hasTravel = userProfile.interests.some(interest => 
    interest.includes('путешествия') || 
    interest.includes('туризм') || 
    interest.includes('travel') ||
    interest.includes('отдых')
  );
  
  if (!hasTravel) return [];
  
  const alerts = [];
  const temp = Math.round(weather.main?.temp || weather.temp || 0);
  const humidity = weather.main?.humidity || weather.humidity || 0;
  const windSpeed = Math.round((weather.wind?.speed || 0) * 3.6);
  const pressure = weather.main?.pressure || 1013;
  const clouds = weather.clouds?.all || 0;
  const visibility = weather.visibility ? Math.round(weather.visibility / 1000) : 10;
  const rain = weather.rain?.['1h'] || 0;
  const snow = weather.snow?.['1h'] || 0;
  const uvIndex = uvData?.uvi || 0;
  
  // 🌞 ИДЕАЛЬНАЯ ПОГОДА ДЛЯ ПРОГУЛОК
  if (temp >= 18 && temp <= 26 && rain === 0 && snow === 0 && windSpeed < 20 && clouds < 50) {
    alerts.push({
      id: 'perfect_walking',
      type: 'excellent',
      icon: '🚶‍♂️',
      title: 'Идеально для прогулок',
      message: `${temp}°C, ясно - отличный день для исследований`,
      color: '#10b981',
      bgColor: '#10b98120',
      priority: 15,
      advice: [
        'Планируйте пешие экскурсии',
        'Посетите открытые достопримечательности',
        'Гуляйте по историческому центру'
      ]
    });
  }
  
  // ☀️ ПЛЯЖНАЯ ПОГОДА
  if (temp >= 25 && temp <= 35 && rain === 0 && windSpeed < 25 && uvIndex >= 6) {
    alerts.push({
      id: 'beach_weather',
      type: 'excellent',
      icon: '🏖️',
      title: 'Пляжная погода!',
      message: `${temp}°C, UV ${uvIndex} - время для пляжа`,
      color: '#f59e0b',
      bgColor: '#f59e0b20',
      priority: 14,
      advice: [
        'Не забудьте солнцезащитный крем SPF 30+',
        'Пейте больше воды',
        'Ищите тень в полуденные часы'
      ]
    });
  }
  
  // 🌧️ ДОЖДЬ - НЕ ПОМЕХА
  if (rain > 0 && rain < 10 && temp > 15 && windSpeed < 20) {
    alerts.push({
      id: 'light_rain_travel',
      type: 'info',
      icon: '☔',
      title: 'Дождичек не помеха',
      message: `${rain}мм/ч - время для музеев и кафе`,
      color: '#06b6d4',
      bgColor: '#06b6d420',
      priority: 8,
      advice: [
        'Посетите музеи и галереи',
        'Уютные кафе и рестораны',
        'Крытые рынки и торговые центры'
      ]
    });
  }
  
  // ⛈️ СИЛЬНЫЙ ДОЖДЬ/ГРОЗА
  if (rain > 10 || (weather.weather && weather.weather[0]?.main === 'Thunderstorm')) {
    alerts.push({
      id: 'heavy_rain_warning',
      type: 'warning',
      icon: '⛈️',
      title: 'Сильный дождь/гроза',
      message: 'Ограничьте передвижения по городу',
      color: '#f59e0b',
      bgColor: '#f59e0b20',
      priority: 12,
      advice: [
        'Избегайте открытых пространств',
        'Используйте крытый транспорт',
        'Подождите в помещении'
      ]
    });
  }
  
  // 🌨️ СНЕГ
  if (snow > 0) {
    if (snow < 5 && temp > -5) {
      alerts.push({
        id: 'light_snow',
        type: 'info',
        icon: '🌨️',
        title: 'Лёгкий снежок',
        message: 'Красивая зимняя атмосфера',
        color: '#06b6d4',
        bgColor: '#06b6d415',
        priority: 7,
        advice: [
          'Одевайтесь теплее',
          'Осторожно на скользких дорожках',
          'Красивые зимние фото'
        ]
      });
    } else {
      alerts.push({
        id: 'heavy_snow',
        type: 'warning',
        icon: '❄️',
        title: 'Сильный снегопад',
        message: 'Затруднения в передвижении',
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        priority: 11,
        advice: [
          'Планируйте больше времени на дорогу',
          'Используйте общественный транспорт',
          'Отложите дальние поездки'
        ]
      });
    }
  }
  
  // 🥵 ЭКСТРЕМАЛЬНАЯ ЖАРА
  if (temp > 35) {
    alerts.push({
      id: 'extreme_heat',
      type: 'critical',
      icon: '🥵',
      title: 'Экстремальная жара',
      message: `${temp}°C - опасно для здоровья`,
      color: '#ef4444',
      bgColor: '#ef444420',
      priority: 16,
      advice: [
        'Избегайте улицы 11:00-17:00',
        'Пейте воду каждые 15-20 минут',
        'Ищите кондиционированные помещения'
      ]
    });
  }
  
  // 🥶 ЭКСТРЕМАЛЬНЫЙ ХОЛОД
  if (temp < -15) {
    alerts.push({
      id: 'extreme_cold',
      type: 'critical',
      icon: '🥶',
      title: 'Экстремальный холод',
      message: `${temp}°C - риск обморожения`,
      color: '#ef4444',
      bgColor: '#ef444420',
      priority: 16,
      advice: [
        'Ограничьте время на улице',
        'Многослойная одежда обязательна',
        'Защитите лицо и руки'
      ]
    });
  }
  
  // 💨 СИЛЬНЫЙ ВЕТЕР
  if (windSpeed > 30) {
    alerts.push({
      id: 'strong_wind_travel',
      type: 'warning',
      icon: '💨',
      title: 'Сильный ветер',
      message: `${windSpeed} км/ч - осторожность в городе`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 10,
      advice: [
        'Избегайте высоких зданий',
        'Осторожно с зонтами',
        'Держитесь подальше от деревьев'
      ]
    });
  }
  
  // 🌫️ ПЛОХАЯ ВИДИМОСТЬ
  if (visibility < 2) {
    alerts.push({
      id: 'poor_visibility',
      type: 'warning',
      icon: '🌫️',
      title: 'Плохая видимость',
      message: `Видимость ${visibility}км - туман/смог`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 9,
      advice: [
        'Будьте осторожны на дорогах',
        'Избегайте высоких точек',
        'Используйте GPS-навигацию'
      ]
    });
  }
  
  // ☁️ ОТЛИЧНАЯ ВИДИМОСТЬ
  if (visibility >= 10 && clouds < 30) {
    alerts.push({
      id: 'great_visibility',
      type: 'excellent',
      icon: '🔭',
      title: 'Отличная видимость',
      message: `${visibility}км - прекрасные виды`,
      color: '#3b82f6',
      bgColor: '#3b82f620',
      priority: 6,
      advice: [
        'Поднимитесь на смотровые площадки',
        'Идеальное время для осмотра окрестностей',
        'Дальние прогулки за город'
      ]
    });
  }
  
  // 🎒 КОМФОРТ ДЛЯ ПЕШИХ ПОХОДОВ
  if (temp >= 10 && temp <= 22 && rain === 0 && windSpeed < 20 && humidity < 80) {
    alerts.push({
      id: 'hiking_weather',
      type: 'excellent',
      icon: '🥾',
      title: 'Отлично для походов',
      message: `${temp}°C, сухо - идеально для треккинга`,
      color: '#22c55e',
      bgColor: '#22c55e20',
      priority: 13,
      advice: [
        'Планируйте маршруты на природе',
        'Посетите национальные парки',
        'Возьмите воду и перекус'
      ]
    });
  }
  
  // 🌊 ВЫСОКОЕ ДАВЛЕНИЕ - ГОЛОВНЫЕ БОЛИ
  if (pressure > 1020) {
    alerts.push({
      id: 'high_pressure_travel',
      type: 'info',
      icon: '🤕',
      title: 'Высокое давление',
      message: `${pressure} гПа - возможны головные боли`,
      color: '#6b7280',
      bgColor: '#6b728015',
      priority: 4,
      advice: [
        'Пейте больше воды',
        'Избегайте резких движений',
        'Делайте частые перерывы'
      ]
    });
  }
  
  // 🛫 УСЛОВИЯ ДЛЯ АВИАПЕРЕЛЕТОВ
  if (windSpeed > 40 || visibility < 1) {
    alerts.push({
      id: 'flight_delays',
      type: 'warning',
      icon: '✈️',
      title: 'Возможны задержки рейсов',
      message: 'Плохие условия для авиации',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 13,
      advice: [
        'Проверьте статус рейса',
        'Приезжайте в аэропорт заранее',
        'Имейте запасной план'
      ]
    });
  }
  
  // 🚗 УСЛОВИЯ ДЛЯ АВТОМОБИЛЬНЫХ ПОЕЗДОК
  if ((rain > 5 || snow > 2) && visibility < 5) {
    alerts.push({
      id: 'driving_conditions',
      type: 'warning',
      icon: '🚗',
      title: 'Сложные условия вождения',
      message: 'Осторожность на дорогах',
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 11,
      advice: [
        'Снизьте скорость',
        'Увеличьте дистанцию',
        'Включите фары'
      ]
    });
  }
  
  // 🧴 UV ЗАЩИТА
  if (uvIndex >= 8) {
    alerts.push({
      id: 'uv_protection',
      type: 'warning',
      icon: '🧴',
      title: 'Высокий UV-индекс',
      message: `UV ${uvIndex} - обязательна защита`,
      color: '#f59e0b',
      bgColor: '#f59e0b15',
      priority: 8,
      advice: [
        'Солнцезащитный крем SPF 50+',
        'Шляпа и солнечные очки',
        'Избегайте полуденного солнца'
      ]
    });
  }
  
  // 💧 ГИДРАТАЦИЯ В ЖАРУ
  if (temp > 28 && humidity < 40) {
    alerts.push({
      id: 'dehydration_risk',
      type: 'info',
      icon: '💧',
      title: 'Риск обезвоживания',
      message: `${temp}°C, сухой воздух - пейте больше`,
      color: '#06b6d4',
      bgColor: '#06b6d415',
      priority: 7,
      advice: [
        'Носите бутылку воды',
        'Пейте каждые 30 минут',
        'Избегайте алкоголя днем'
      ]
    });
  }
  
  // 🎭 УСЛОВИЯ ДЛЯ КУЛЬТУРНЫХ МЕРОПРИЯТИЙ
  if (temp >= 15 && temp <= 25 && rain === 0 && windSpeed < 15) {
    alerts.push({
      id: 'outdoor_events',
      type: 'excellent',
      icon: '🎭',
      title: 'Отлично для мероприятий',
      message: 'Комфортно для концертов и фестивалей',
      color: '#8b5cf6',
      bgColor: '#8b5cf615',
      priority: 9,
      advice: [
        'Ищите уличные концерты',
        'Посетите фестивали и ярмарки',
        'Открытые театральные площадки'
      ]
    });
  }
  
  // 🔍 АНАЛИЗ ЛУЧШЕГО ДНЯ ДЛЯ ПОЕЗДОК
  if (forecastData && forecastData.length > 0) {
    let bestDay = null;
    let bestScore = 0;
    
    // Группируем прогноз по дням
    const dayGroups = {};
    forecastData.forEach(item => {
      const itemDate = new Date(item.dt * 1000);
      const dayKey = itemDate.toDateString();
      
      if (!dayGroups[dayKey]) {
        dayGroups[dayKey] = [];
      }
      dayGroups[dayKey].push(item);
    });
    
    Object.keys(dayGroups).slice(1, 4).forEach(dayKey => { // Следующие 3 дня
      const dayData = dayGroups[dayKey];
      const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
      const maxRain = Math.max(...dayData.map(item => item.rain?.['3h'] || 0));
      const avgWind = dayData.reduce((sum, item) => sum + (item.wind?.speed || 0), 0) / dayData.length * 3.6;
      const avgClouds = dayData.reduce((sum, item) => sum + (item.clouds?.all || 0), 0) / dayData.length;
      
      // Вычисляем оценку дня для путешествий
      let score = 0;
      
      // Температура (18-26°C идеально)
      if (avgTemp >= 18 && avgTemp <= 26) score += 40;
      else if (avgTemp >= 15 && avgTemp <= 30) score += 25;
      else if (avgTemp >= 10 && avgTemp <= 35) score += 10;
      
      // Дождь (чем меньше, тем лучше)
      if (maxRain === 0) score += 30;
      else if (maxRain < 2) score += 20;
      else if (maxRain < 5) score += 10;
      
      // Ветер (умеренный лучше)
      if (avgWind < 15) score += 20;
      else if (avgWind < 25) score += 10;
      
      // Облачность (частично облачно идеально)
      if (avgClouds >= 20 && avgClouds <= 60) score += 15;
      else if (avgClouds < 20 || avgClouds <= 80) score += 10;
      
      if (score > bestScore) {
        bestScore = score;
        const date = new Date(dayKey);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
        
        bestDay = {
          date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          dayName,
          temp: Math.round(avgTemp),
          rain: maxRain,
          wind: Math.round(avgWind),
          clouds: Math.round(avgClouds)
        };
      }
    });
    
    if (bestDay && bestScore > 60) {
      alerts.push({
        id: 'best_travel_day',
        type: 'prediction',
        icon: '📅',
        title: `Лучший день: ${bestDay.dayName}`,
        message: `${bestDay.date} - ${bestDay.temp}°C, идеально для поездок`,
        color: '#8b5cf6',
        bgColor: '#8b5cf615',
        priority: 5,
        advice: [
          'Планируйте главные экскурсии',
          'Бронируйте билеты заранее',
          'Подготовьте маршрут'
        ]
      });
    }
  }
  
  // Сортируем по приоритету
  return alerts.sort((a, b) => b.priority - a.priority);
}

// Функция получения цветовой темы
function getTravelTheme(alerts) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical').length;
  const excellentAlerts = alerts.filter(alert => alert.type === 'excellent').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;
  
  if (criticalAlerts > 0) {
    return {
      mainColor: '#ef4444',
      bgColor: '#ef444415',
      iconBgColor: '#ef444410'
    };
  } else if (excellentAlerts > 0) {
    return {
      mainColor: '#10b981',
      bgColor: '#10b98115',
      iconBgColor: '#10b98110'
    };
  } else if (warningAlerts > 0) {
    return {
      mainColor: '#f59e0b',
      bgColor: '#f59e0b15',
      iconBgColor: '#f59e0b10'
    };
  } else {
    return {
      mainColor: '#3b82f6',
      bgColor: '#3b82f615',
      iconBgColor: '#3b82f610'
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

export default function TravelAlerts({ weather, userProfile, forecastData, uvData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alerts = analyzeTravelConditions(weather, userProfile, forecastData, uvData);
  const theme = getTravelTheme(alerts);
  
  // Если нет профиля или интереса к путешествиям
  if (!userProfile || !userProfile.interests) {
    return null;
  }
  
  const hasTravel = userProfile.interests.some(interest => 
    interest.includes('путешествия') || 
    interest.includes('туризм') || 
    interest.includes('travel') ||
    interest.includes('отдых')
  );
  
  if (!hasTravel) {
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
          ✈️ Путешествия
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Анализируем условия...
        </div>
      </div>
    );
  }
  
  // Главный алерт для превью
  const mainAlert = alerts[0];
  const excellentCount = alerts.filter(alert => alert.type === 'excellent').length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
  
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
          : criticalCount > 0 
            ? `2px solid #ef444440`
            : "1px solid rgba(255,255,255,0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
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
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            } : criticalCount > 0 ? {
              scale: [1, 1.05, 1],
              color: ['#ef4444', '#dc2626', '#ef4444']
            } : {}}
            transition={{
              duration: 2,
              repeat: (excellentCount > 0 || criticalCount > 0) ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            {mainAlert.icon}
          </motion.div>

          {/* Текст */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e293b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.2',
              marginBottom: 2
            }}>
              ✈️ {mainAlert.title}
            </div>
            <div style={{
              fontSize: 13,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif',
              lineHeight: '1.3'
            }}>
              {mainAlert.message}
            </div>
            {alerts.length > 1 && (
              <div style={{
                fontSize: 12,
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