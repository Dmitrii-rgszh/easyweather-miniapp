// Исправленный WeatherCarousel.js - убираем зацикливание, правильная навигация

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

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

  // Добавляем почасовой прогноз на следующие 8 часов
  if (forecastData && forecastData.length > 0) {
    let addedHours = 0;
    let lastHour = now.getHours();
    
    for (const item of forecastData) {
      if (addedHours >= 8) break;
      
      const itemDate = new Date(item.dt * 1000);
      const itemHour = itemDate.getHours();
      
      // Добавляем только будущие часы и избегаем дублирования
      if (itemDate > now && itemHour !== lastHour) {
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
        lastHour = itemHour;
        addedHours++;
      }
    }
  }

  console.log('Generated hourly data:', hourlyData); // Для отладки
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
  onWeatherChange
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
      console.log('Sending weather data for index:', activeIndex, hourlyData[activeIndex]);
      onWeatherChange(hourlyData[activeIndex]);
    }
  }, [activeIndex, hourlyData, onWeatherChange]);

  // Сброс к первому элементу при изменении данных
  useEffect(() => {
    setActiveIndex(0);
  }, [city, temp]);

  // Обработка свайпа
  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 50;
    
    if (info.offset.x > threshold && activeIndex > 0) {
      // Свайп вправо - предыдущий элемент
      setActiveIndex(activeIndex - 1);
    } else if (info.offset.x < -threshold && activeIndex < hourlyData.length - 1) {
      // Свайп влево - следующий элемент
      setActiveIndex(activeIndex + 1);
    }
    
    x.set(0);
  };

  // Клик по индикатору
  const handleDotClick = (index) => {
    if (index >= 0 && index < hourlyData.length) {
      setActiveIndex(index);
    }
  };

  const activeWeather = hourlyData[activeIndex] || hourlyData[0];

  if (!activeWeather) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{
      margin: "0 auto 15px auto",
      maxWidth: 320,
      borderRadius: 24,
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 16px rgba(56, 189, 248, 0.2)",
      position: "relative",
      overflow: "hidden",
      padding: "8px 16px"
    }}>
      {/* Фоновое изображение города */}
      {photoUrl && (
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 24,
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
            filter: "blur(2px)",
            pointerEvents: "none",
            transition: "opacity 0.3s"
          }}
        />
      )}

      {/* Весь контент поверх фото */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Название города */}
        <h2 style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 600,
          color: "#1e293b",
          margin: "0 0 0px 0",
          letterSpacing: 1,
          lineHeight: 1.4,
          fontFamily: "Montserrat, Arial, sans-serif"
        }}>
          {city}
        </h2>

        {/* Карусель с контентом */}
        <div style={{ 
          position: "relative", 
          overflow: "hidden", 
          borderRadius: 16,
          height: 190,
          marginBottom: 6 
        }}>
          <motion.div
            ref={carouselRef}
            style={{
              display: "flex",
              width: `${hourlyData.length * 100}%`,
              height: "100%",
              x
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
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
            {hourlyData.map((weather, index) => {
              const isActive = index === activeIndex;
              
              return (
                <motion.div
                  key={`${weather.time}-${index}`}
                  style={{
                    width: `${100 / hourlyData.length}%`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    opacity: isActive ? 1 : 0.6,
                    pointerEvents: isDragging ? "none" : "auto"
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Белый контейнер для активного элемента */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: 16,
                        padding: "8px",
                        marginBottom: 6,
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        width: 160,
                        height: 160,
                        minWidth: 160,
                        maxWidth: 160,
                        minHeight: 160,
                        maxHeight: 160,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                        overflow: "hidden"
                      }}
                    >
                      {/* Верхняя часть - иконка и текст рядом */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 6
                      }}>
                        {/* Левая часть - иконка */}
                        <div style={{
                          width: 70,
                          height: 70,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #38bdf8 0%, #bae6fd 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)",
                          flexShrink: 0
                        }}>
                          <img
                            src={weather.icon}
                            alt={weather.desc}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "contain"
                            }}
                          />
                        </div>

                        {/* Правая часть - время и температура */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center"
                        }}>
                          {/* Время */}
                          <div style={{
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#64748b",
                            marginBottom: 4,
                            fontFamily: "Montserrat, Arial, sans-serif"
                          }}>
                            {weather.time}
                          </div>

                          {/* Температура */}
                          <div style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#2563eb",
                            fontFamily: "Montserrat, Arial, sans-serif",
                            lineHeight: 1
                          }}>
                            {weather.temp}°
                          </div>
                        </div>
                      </div>

                      {/* Описание снизу по центру */}
                      <div style={{
                        fontSize: 16,
                        color: "#64748b",
                        fontFamily: "Montserrat, Arial, sans-serif",
                        lineHeight: 1.3,
                        textAlign: "center",
                        wordWrap: "break-word",
                        hyphens: "auto",
                        width: "100%",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      }}>
                        {weather.desc}
                      </div>
                    </motion.div>
                  )}

                  {/* Для неактивных элементов - компактный вид */}
                  {!isActive && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      opacity: 0.6,
                      minHeight: 120,
                      justifyContent: "center"
                    }}>
                      {/* Время */}
                      <div style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#64748b",
                        marginBottom: 8,
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {weather.time}
                      </div>

                      {/* Иконка */}
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #38bdf8 0%, #bae6fd 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 6
                      }}>
                        <img
                          src={weather.icon}
                          alt={weather.desc}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: "contain"
                          }}
                        />
                      </div>

                      {/* Температура */}
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#64748b",
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {weather.temp}°
                      </div>
                    </div>
                  )}
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
              marginBottom: 6,
              padding: "8px",
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

        {/* Индикаторы с белым фоном и отступом */}
        {hourlyData.length > 1 && (
          <div style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: 12,
            padding: "4px 8px",
            margin: "8px auto 4px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            width: "fit-content"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 8
            }}>
              {hourlyData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  style={{
                    width: activeIndex === index ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    background: activeIndex === index 
                      ? "#3b82f6" 
                      : "#cbd5e1",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0
                  }}
                  aria-label={`Переключиться на ${hourlyData[index].time}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}