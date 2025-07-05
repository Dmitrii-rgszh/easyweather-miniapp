// Новый компонент WeatherCarousel - интерактивная карусель с почасовым прогнозом

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// Функция создания почасового прогноза
function generateHourlyForecast(currentWeather, forecastData) {
  const hourlyData = [];
  const now = new Date();
  
  // Первый элемент - текущая погода
  hourlyData.push({
    time: "Сейчас",
    temp: currentWeather.temp,
    icon: currentWeather.icon,
    desc: currentWeather.desc,
    details: currentWeather.details,
    isNow: true
  });

  // Добавляем почасовой прогноз на следующие 8 часов (только ровные часы)
  if (forecastData && forecastData.length > 0) {
    let addedHours = 0;
    
    for (const item of forecastData) {
      if (addedHours >= 8) break;
      
      const itemDate = new Date(item.dt * 1000);
      const itemHour = itemDate.getHours();
      const itemMinutes = itemDate.getMinutes();
      
      // Берем только ровные часы (00 минут) и будущие данные
      if (itemMinutes === 0 && itemDate > now) {
        hourlyData.push({
          time: `${itemHour.toString().padStart(2, '0')}:00`,
          temp: Math.round(item.main.temp),
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          desc: item.weather[0].description[0].toUpperCase() + item.weather[0].description.slice(1),
          details: {
            feels: Math.round(item.main.feels_like),
            pressure: Math.round(item.main.pressure * 0.750062),
            humidity: item.main.humidity,
            wind: `${Math.round(item.wind.speed)} м/с`
          },
          isNow: false
        });
        addedHours++;
      }
    }
  }

  return hourlyData;
}

export default function WeatherCarousel({ 
  city, 
  temp, 
  desc, 
  icon, 
  details, 
  forecastData, 
  photoUrl,
  onWeatherChange // Колбек для передачи выбранных данных наверх
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef(null);
  const x = useMotionValue(0);
  
  // Генерируем почасовые данные
  const hourlyData = generateHourlyForecast(
    { temp, desc, icon, details }, 
    forecastData
  );

  // Отправляем данные выбранного времени родительскому компоненту
  useEffect(() => {
    if (onWeatherChange && hourlyData[activeIndex]) {
      onWeatherChange(hourlyData[activeIndex]);
    }
  }, [activeIndex, onWeatherChange]);

  // Обработка свайпа
  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 50;
    
    if (info.offset.x > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (info.offset.x < -threshold && activeIndex < hourlyData.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
    
    x.set(0);
  };

  // Клик по индикатору
  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  const activeWeather = hourlyData[activeIndex] || hourlyData[0];

  return (
    <div style={{
      margin: "0 auto",
      maxWidth: 320,
      borderRadius: 24,
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(56, 189, 248, 0.2)",
      position: "relative",
      overflow: "hidden",
      padding: "20px"
    }}>
      {/* Фоновое изображение города */}
      {photoUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(3px)",
            pointerEvents: "none",
            borderRadius: 24
          }}
        />
      )}

      {/* Контент поверх фона */}
      <div style={{ position: "relative", zIndex: 1 }}>
        
        {/* Название города */}
        <div style={{
          fontSize: 24,
          fontWeight: 600,
          textAlign: "center",
          color: "#1e293b",
          marginBottom: 20,
          fontFamily: "Montserrat, Arial, sans-serif",
          letterSpacing: 1
        }}>
          {city}
        </div>

        {/* Карусель */}
        <div style={{ 
          position: "relative", 
          height: 200,
          marginBottom: 20,
          overflow: "hidden"
        }}>
          <motion.div
            ref={carouselRef}
            style={{
              display: "flex",
              width: `${hourlyData.length * 100}%`,
              height: "100%",
              x: useTransform(x, (value) => 
                value - (activeIndex * (100 / hourlyData.length)) + "%"
              )
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            animate={{
              x: `${-activeIndex * (100 / hourlyData.length)}%`
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {hourlyData.map((item, index) => {
              const distance = Math.abs(index - activeIndex);
              const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.4);
              const scale = distance === 0 ? 1 : Math.max(0.75, 1 - distance * 0.15);

              return (
                <motion.div
                  key={index}
                  style={{
                    width: `${100 / hourlyData.length}%`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                  animate={{
                    opacity,
                    scale
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  {/* Карточка погоды */}
                  <div style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 20,
                    padding: "16px",
                    textAlign: "center",
                    border: "2px solid rgba(56, 189, 248, 0.2)",
                    boxShadow: distance === 0 
                      ? "0 8px 24px rgba(56, 189, 248, 0.3)" 
                      : "0 4px 12px rgba(0, 0, 0, 0.1)",
                    minWidth: 120,
                    transform: `translateY(${distance === 0 ? 0 : 10}px)`
                  }}>
                    {/* Время */}
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: item.isNow ? "#ef4444" : "#1e40af",
                      marginBottom: 8,
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {item.time}
                    </div>

                    {/* Иконка погоды */}
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #38bdf8 0%, #bae6fd 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)"
                    }}>
                      <img
                        src={item.icon}
                        alt={item.desc}
                        style={{
                          width: 56,
                          height: 56,
                          display: "block"
                        }}
                      />
                    </div>

                    {/* Температура */}
                    <div style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#2498dc",
                      marginBottom: 4,
                      fontFamily: "Montserrat, Arial, sans-serif"
                    }}>
                      {item.temp}°
                    </div>

                    {/* Описание */}
                    <div style={{
                      fontSize: 12,
                      color: "#64748b",
                      fontFamily: "Montserrat, Arial, sans-serif",
                      lineHeight: 1.3
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Детали погоды для активного времени */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
              padding: "12px",
              background: "rgba(248, 250, 252, 0.8)",
              borderRadius: 12,
              border: "1px solid rgba(56, 189, 248, 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: 11, 
                color: "#64748b", 
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                Ощущается
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#1e293b",
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                {activeWeather.details?.feels}°
              </div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: 11, 
                color: "#64748b", 
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                Давление
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#1e293b",
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                {activeWeather.details?.pressure} мм
              </div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: 11, 
                color: "#64748b", 
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                Влажность
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#1e293b",
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                {activeWeather.details?.humidity}%
              </div>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: 11, 
                color: "#64748b", 
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                Ветер
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#1e293b",
                fontFamily: "Montserrat, Arial, sans-serif" 
              }}>
                {activeWeather.details?.wind}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Индикаторы точки */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 6
        }}>
          {hourlyData.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: index === activeIndex 
                  ? "#38bdf8" 
                  : "rgba(56, 189, 248, 0.3)",
                transition: "all 0.3s ease"
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}