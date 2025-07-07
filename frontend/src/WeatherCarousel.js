// Обновленный WeatherCarousel.js с анимированными стрелочками навигации
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

// Анимированные стрелочки навигации
const NavigationArrow = ({ direction, onClick, isVisible, animationKey }) => {
  const isLeft = direction === 'left';
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      key={`arrow-${direction}-${animationKey}`} // Используем ключ для синхронизации
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? 'left' : 'right']: 8,
        transform: "translateY(-50%)",
        width: 40,
        height: 40,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(59, 130, 246, 0.2)"
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        scale: { duration: 0.1 },
        opacity: { duration: 0.2 }
      }}
    >
      <motion.button
        onClick={onClick}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8
        }}
        animate={{ 
          x: isLeft ? [-2, 2, -2] : [2, -2, 2] // Синхронное движение
        }}
        whileHover={{ 
          scale: 1.05,
          x: isLeft ? -4 : 4
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          x: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          },
          scale: { duration: 0.1 }
        }}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            x: isLeft ? [-1, 1, -1] : [1, -1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <path
            d={isLeft ? "M15 18L9 12L15 6" : "M9 6L15 12L9 18"}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>
    </motion.div>
  );
};

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

  console.log('Generated hourly data:', hourlyData);
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
  const [animationKey, setAnimationKey] = useState(0); // Ключ для синхронизации анимации
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
    setAnimationKey(prev => prev + 1); // Сбрасываем анимацию при изменении данных
  }, [city, temp]);

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

  // Функции навигации стрелочками
  const goToPrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex < hourlyData.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
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

  // Определяем видимость стрелочек
  const showLeftArrow = activeIndex > 0;
  const showRightArrow = activeIndex < hourlyData.length - 1;

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
          margin: "0 0 10px 0",
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
          height: 240, // Увеличил высоту под квадрат
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
                    opacity: isActive ? 1 : 0.6
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Активный элемент - полная информация */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "200px", // КВАДРАТ
                        height: "200px", // КВАДРАТ
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 16,
                        padding: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        justifyContent: "center",
                        position: "relative" // Для позиционирования стрелок внутри
                      }}
                    >
                      {/* Левая стрелочка - увеличенная, без рамки и тени */}
                      {showLeftArrow && (
                        <motion.div
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "calc(50% - 10px)",
                            transform: "translateY(-50%)",
                            width: 36, // Увеличил размер
                            height: 36,
                            background: "rgba(255, 255, 255, 0.9)", // Убрал тень и рамку
                            borderRadius: "50%", // Круглая форма
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10,
                            cursor: "pointer"
                          }}
                          animate={{ x: [-2, 2, -2] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                          onClick={goToPrevious}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                        >
                          <svg
                            width="20" // Увеличил размер иконки
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15 18L9 12L15 6"
                              stroke="#3b82f6"
                              strokeWidth="2.5" // Толще линия
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}

                      {/* Правая стрелочка - увеличенная, без рамки и тени */}
                      {showRightArrow && (
                        <motion.div
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "calc(50% - 10px)",
                            transform: "translateY(-50%)",
                            width: 36, // Увеличил размер
                            height: 36,
                            background: "rgba(255, 255, 255, 0.9)", // Убрал тень и рамку
                            borderRadius: "50%", // Круглая форма
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10,
                            cursor: "pointer"
                          }}
                          animate={{ x: [2, -2, 2] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                          onClick={goToNext}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                        >
                          <svg
                            width="20" // Увеличил размер иконки
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 6L15 12L9 18"
                              stroke="#3b82f6"
                              strokeWidth="2.5" // Толще линия
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}

                      {/* Время - увеличенный размер */}
                      <div style={{
                        fontSize: 18, // Увеличил с 14 до 18
                        fontWeight: 600,
                        color: "#3b82f6",
                        marginBottom: 12,
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {weather.time}
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
                        marginBottom: 12,
                        boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)"
                      }}>
                        <img
                          src={weather.icon}
                          alt={weather.desc}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "contain"
                          }}
                        />
                      </div>

                      {/* Температура - увеличенный размер */}
                      <div style={{
                        fontSize: 32, // Увеличил с 24 до 32
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: 8,
                        fontFamily: "Montserrat, Arial, sans-serif"
                      }}>
                        {weather.temp}°
                      </div>

                      {/* Описание - увеличенный размер */}
                      <div style={{
                        fontSize: 14, // Увеличил с 12 до 14
                        color: "#64748b",
                        textAlign: "center",
                        fontFamily: "Montserrat, Arial, sans-serif",
                        width: "100%",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        paddingX: "40px" // Увеличил отступы для больших стрелок
                      }}>
                        {weather.desc}
                      </div>
                    </motion.div>
                  )}

                  {/* Неактивные элементы - компактный вид */}
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
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1e293b",
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

        {/* Детали погоды активного элемента */}
        <motion.div
          key={`details-${activeIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            padding: "8px 12px",
            background: "rgba(255, 255, 255, 0.95)", // Более белый фон
            backdropFilter: "blur(10px)",
            borderRadius: 12,
            marginBottom: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Montserrat" }}>
              Ощущается
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", fontFamily: "Montserrat" }}>
              {activeWeather.details?.feels || '--'}°
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Montserrat" }}>
              Давление
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", fontFamily: "Montserrat" }}>
              {activeWeather.details?.pressure || '--'} мм
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Montserrat" }}>
              Влажность
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", fontFamily: "Montserrat" }}>
              {activeWeather.details?.humidity || '--'}%
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Montserrat" }}>
              Ветер
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", fontFamily: "Montserrat" }}>
              {activeWeather.details?.wind || '--'}
            </div>
          </div>
        </motion.div>

        {/* Индикаторы точек */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          margin: "8px 0 4px 0"
        }}>
          <div style={{
            display: "flex",
            gap: 4,
            padding: "4px 8px",
            background: "rgba(255, 255, 255, 0.95)", // Более белый фон
            backdropFilter: "blur(8px)",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
          {hourlyData.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              style={{
                width: index === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                border: "none",
                background: index === activeIndex ? "#3b82f6" : "rgba(59, 130, 246, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
