import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import AdBanner from "./AdBanner";
import WeatherCard from "./WeatherCard";
import CityDateInput from "./CityDateInput";
import { fetchWeather, fetchForecast } from "./weatherApi";
import { getCityByCoords } from "./geoApi";

function CloudsEffect() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${i * 24 + 7}%`,
            top: `${40 + i * 18}px`,
            width: 110 + i * 32,
            height: 42 + i * 19,
            background: "rgba(255,255,255,0.60)",
            borderRadius: "50%",
            filter: "blur(14px)",
            opacity: 0.58 - i * 0.1,
            zIndex: 99,
            pointerEvents: "none"
          }}
          animate={{
            x: [0, 28 + i * 11, 0]
          }}
          transition={{
            duration: 29 + i * 6,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
    </>
  );
}
function RainEffect() {
  return (
    <>
      {[...Array(18)].map((_, i) => {
        const isGlow = i % 3 === 0;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${6 + Math.random() * 88}%`,
              top: `${-24 + Math.random() * 18}%`,
              width: 8 + Math.random() * 9,
              height: 28 + Math.random() * 20,
              background: isGlow
                ? "linear-gradient(180deg,#60a5fa88 0%,#38bdf8bb 100%)"
                : "rgba(92,160,240,0.20)",
              borderRadius: "40%",
              filter: isGlow ? "blur(3px)" : "blur(1.1px)",
              boxShadow: isGlow ? "0 0 16px 3px #38bdf8aa" : undefined,
              opacity: isGlow ? 0.5 : 0.32,
              zIndex: 99,
              pointerEvents: "none"
            }}
            animate={{
              y: ["0%", "128%"],
              opacity: [0.45, 0.63, 0]
            }}
            transition={{
              duration: 2.8 + Math.random() * 2.7,
              repeat: Infinity,
              delay: i * 0.23
            }}
          />
        );
      })}
    </>
  );
}
function SnowEffect() {
  return (
    <>
      {[...Array(20)].map((_, i) => {
        const isLight = i % 4 === 0;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: `${2 + Math.random() * 95}%`,
              top: `${-14 + Math.random() * 14}%`,
              width: isLight ? 9 : 13 + Math.random() * 8,
              height: isLight ? 9 : 13 + Math.random() * 8,
              background: isLight
                ? "rgba(230,240,255,0.09)"
                : "rgba(210,230,255,0.22)",
              borderRadius: "50%",
              filter: isLight ? "blur(2.3px)" : "blur(1.6px)",
              opacity: isLight ? 0.16 : 0.27,
              zIndex: 99,
              pointerEvents: "none"
            }}
            animate={{
              y: ["0%", "160%"],
              x: [0, 12 - Math.random() * 18, 0],
              opacity: isLight
                ? [0.12, 0.15, 0.10]
                : [0.20, 0.34, 0.13]
            }}
            transition={{
              duration: 7 + Math.random() * 3.9,
              repeat: Infinity,
              delay: i * 0.56
            }}
          />
        );
      })}
    </>
  );
}
function SunEffect() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          right: 60,
          top: 32,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 45%, #fffcd988 55%, #fbbf2499 100%)",
          boxShadow: "0 0 84px 30px #fffec966",
          zIndex: 0,
          opacity: 0.79,
          pointerEvents: "none"
        }}
        animate={{
          scale: [1, 1.06, 0.98, 1],
          opacity: [0.79, 0.93, 0.68, 0.79],
          filter: [
            "blur(2.3px)",
            "blur(4.3px)",
            "blur(2.3px)",
            "blur(1.4px)"
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          right: 112,
          top: 72,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffe37d 70%, #fff0 100%)",
          boxShadow: "0 0 22px 6px #ffef6e88",
          zIndex: 3,
          opacity: 0.91,
          pointerEvents: "none"
        }}
        animate={{
          scale: [1, 1.09, 1.04, 1],
          opacity: [0.91, 0.99, 0.81, 0.91]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
    </>
  );
}
function NightGlow() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          left: "9%",
          top: "-16%",
          width: "82%",
          height: 230,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #29297a66 0%, #25284dbb 100%)",
          filter: "blur(40px)",
          opacity: 0.82,
          zIndex: 1,
          pointerEvents: "none"
        }}
        animate={{ scale: [1, 1.12, 0.93, 1] }}
        transition={{ duration: 17, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: "62%",
          bottom: "-11%",
          width: 180,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7d86c799 0%, #1a203bff 100%)",
          filter: "blur(44px)",
          opacity: 0.47,
          zIndex: 1,
          pointerEvents: "none"
        }}
        animate={{ scale: [1, 1.07, 0.98, 1] }}
        transition={{ duration: 23, repeat: Infinity, repeatType: "mirror" }}
      />
    </>
  );
}

// --- Тема ---
const theme = createTheme({
  typography: { fontFamily: ['Montserrat'].join(',') },
});

// --- Получение фото города ---
async function getCityPhoto(city) {
  const ACCESS_KEY = process.env.REACT_APP_UNSPLASH_KEY;
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(city)}%20landmark&orientation=landscape&client_id=${ACCESS_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.urls?.regular || null;
  } catch {
    return null;
  }
}

// --- Проверка, сегодняшняя ли дата ---
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// --- Находит ближайший прогноз на нужный час выбранного дня ---
function findNearestForecast(forecastList, targetDate, targetHour) {
  const target = new Date(targetDate);
  target.setHours(targetHour, 0, 0, 0);

  let minDiff = Infinity, nearest = null;
  for (const item of forecastList) {
    const itemDate = new Date(item.dt * 1000);
    if (
      itemDate.getDate() === target.getDate() &&
      itemDate.getMonth() === target.getMonth() &&
      itemDate.getFullYear() === target.getFullYear()
    ) {
      const diff = Math.abs(itemDate - target);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = item;
      }
    }
  }
  return nearest;
}

// --- Цвета фона ---
function getBackground(desc, isNight) {
  if (!desc) return "#232942";
  if (desc.toLowerCase().includes('ясно')) return isNight ? "#22253b" : "linear-gradient(160deg, #7fcfff 0%, #e7e9fd 100%)";
  if (desc.toLowerCase().match(/облач|пасмур|cloud/)) return "linear-gradient(180deg, #bfc9dc 0%, #dbe5fa 100%)";
  if (desc.toLowerCase().includes('дожд')) return "linear-gradient(180deg, #6c7ba1 0%, #b1bfd8 100%)";
  if (desc.toLowerCase().includes('снег')) return "linear-gradient(180deg, #e0f2fc 0%, #f2fafc 100%)";
  return "#c3d3f7";
}

function App() {
  const [city, setCity] = useState("Москва");
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [logoTop, setLogoTop] = useState(32);
  const [desc, setDesc] = useState("");
  const [isNight, setIsNight] = useState(false);

  // --- Центрированный лейбл “Город” ---
  const renderCityLabel = (
    <div style={{
      textAlign: "center",
      marginBottom: 8,
      color: "#fff",
      fontWeight: 500,
      fontSize: 20,
      letterSpacing: 0.3,
      textShadow: "0 2px 8px rgba(0,0,0,0.57), 0 0 1px #fff",
      fontFamily: "Montserrat, Arial, sans-serif"
    }}>
      Город
    </div>
  );

  // --- Адаптивный отступ логотипа ---
  useEffect(() => {
    function handleResize() {
      setLogoTop(window.innerHeight < 500 ? 8 : 32);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Фото города на фоне ---
  useEffect(() => {
    if (weather && weather.city) {
      getCityPhoto(weather.city).then(setPhotoUrl);
    }
  }, [weather && weather.city]);

  // --- ЛОГИКА ЗАПРОСА ПОГОДЫ по городу+дате ---
  const handleShowWeather = async () => {
    setLoading(true);
    try {
      if (isToday(date)) {
        // Сегодня — обычная логика!
        const data = await fetchWeather(city);
        const details = {
          feels:    Math.round(data.main.feels_like),
          pressure: Math.round(data.main.pressure * 0.750062),
          humidity: data.main.humidity,
          wind:     `${Math.round(data.wind.speed)} м/с`,
          sunrise:  "",
          sunset:   ""
        };

        setWeather({
          city:  data.name,
          temp:  Math.round(data.main.temp),
          desc:  data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1),
          icon:  `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
          details
        });

        setDesc(data.weather[0].description);
        setIsNight(data.weather[0].icon.includes("n"));

          const { list: forecastList } = await fetchForecast(city);
          const now = Date.now();
          const upcoming = forecastList
            .map(item => ({ ...item, timeMs: item.dt * 1000 }))
            .filter(item => item.timeMs > now)
            .sort((a, b) => a.timeMs - b.timeMs)
            .slice(0, 3);

          const carusel = upcoming.map(slot => ({
            time: new Date(slot.timeMs)
              .toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            temp: Math.round(slot.main.temp),
            icon: `https://openweathermap.org/img/wn/${slot.weather[0].icon}@2x.png`
          }));
          setForecast(carusel);
      } else {
        // Будущая дата: блок — погода на текущее время, карусель — 08,12,18
        const { list: forecastList } = await fetchForecast(city);
        const now = new Date();
        const targetHour = now.getHours();
        const mainForecast = findNearestForecast(forecastList, date, targetHour);
        setWeather(mainForecast
          ? {
            city: city,
            temp: Math.round(mainForecast.main.temp),
            desc: mainForecast.weather[0].description[0].toUpperCase() + mainForecast.weather[0].description.slice(1),
            icon: `https://openweathermap.org/img/wn/${mainForecast.weather[0].icon}@4x.png`,
            details: {
              feels: Math.round(mainForecast.main.feels_like),
              pressure: Math.round(mainForecast.main.pressure * 0.750062),
              humidity: mainForecast.main.humidity,
              wind: `${Math.round(mainForecast.wind.speed)} м/с`
            }
          }
          : null
        );
        setDesc(mainForecast?.weather?.[0]?.description || "");
        setIsNight(mainForecast?.weather?.[0]?.icon?.includes("n") || false);

        // Карусель: 08:00, 12:00, 18:00
        const hours = [8, 12, 18];
        const carusel = hours
          .map(h => findNearestForecast(forecastList, date, h))
          .filter(Boolean)
          .map(slot => ({
            time: new Date(slot.dt * 1000).toLocaleTimeString('ru-RU', { hour: "2-digit", minute: "2-digit" }),
            temp: Math.round(slot.main.temp),
            icon: `https://openweathermap.org/img/wn/${slot.weather[0].icon}@2x.png`
          }));
        setForecast(carusel);
      }
    } catch (e) {
      alert("Ошибка получения данных");
    }
    setLoading(false);
  };

  // --- ЛОГИКА по геолокации ---
  const handleGeoWeather = () => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается браузером");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const data = await fetchWeather({ lat, lon });
          const details = {
            feels: Math.round(data.main.feels_like),
            pressure: Math.round(data.main.pressure * 0.750062),
            humidity: data.main.humidity,
            wind: `${Math.round(data.wind.speed)} м/с`,
            sunrise: "",
            sunset: ""
          };

          const { list: forecastList } = await fetchForecast({ lat, lon });
          if (isToday(date)) {
            setWeather({
              city: data.name,
              temp: Math.round(data.main.temp),
              desc: data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1),
              icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
              details
            });
            setForecast(forecastList);
          } else {
            const now = new Date();
            const targetHour = now.getHours();
            const mainForecast = findNearestForecast(forecastList, date, targetHour);
            setWeather(mainForecast
              ? {
                city: data.name,
                temp: Math.round(mainForecast.main.temp),
                desc: mainForecast.weather[0].description[0].toUpperCase() + mainForecast.weather[0].description.slice(1),
                icon: `https://openweathermap.org/img/wn/${mainForecast.weather[0].icon}@4x.png`,
                details: {
                  feels: Math.round(mainForecast.main.feels_like),
                  pressure: Math.round(mainForecast.main.pressure * 0.750062),
                  humidity: mainForecast.main.humidity,
                  wind: `${Math.round(mainForecast.wind.speed)} м/с`
                }
              }
              : null
            );
            // Карусель: 08:00, 12:00, 18:00
            const hours = [8, 12, 18];
            const carusel = hours
              .map(h => findNearestForecast(forecastList, date, h))
              .filter(Boolean)
              .map(slot => ({
                time: new Date(slot.dt * 1000).toLocaleTimeString('ru-RU', { hour: "2-digit", minute: "2-digit" }),
                temp: Math.round(slot.main.temp),
                icon: `https://openweathermap.org/img/wn/${slot.weather[0].icon}@2x.png`
              }));
            setForecast(carusel);
          }
        } catch {
          setWeather({ city: "?", temp: '--', desc: 'Ошибка при получении геолокации', icon: '', details: {} });
          setForecast([]);
          setPhotoUrl(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        alert("Не удалось получить геолокацию: " + error.message);
        setLoading(false);
      }
    );
  };

  // --- РЕНДЕР ---
  return (
    <ThemeProvider theme={theme}>
      <motion.div
        key={desc + ('night' : 'day')}
        style={{
          minHeight: '100vh',
          paddingTop: "max(36px, env(safe-area-inset-top))",
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}
        animate={{ background: getBackground(desc, isNight) }}
        transition={{ duration: 1.2 }}
      >
        {/* --- UNSPLASH BACKGROUND --- */}
        {photoUrl && (
          <div
            style={{
              position: "absolute",
              zIndex: -2,
              top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.14,
              filter: "blur(2.2px)",
              pointerEvents: "none"
            }}
          />
        )}

        {/* --- ЭФФЕКТЫ ФОНА --- */}
        {desc && desc.toLowerCase().match(/облач|пасмур|cloud/) && <CloudsEffect />}
        {desc && desc.toLowerCase().includes('дожд') && <RainEffect />}
        {desc && desc.toLowerCase().includes('снег') && <SnowEffect />}
        {desc && desc.toLowerCase().includes('ясно') && !isNight && <SunEffect />}
        {isNight && <NightGlow />}

        {/* --- ЛОГО --- */}
        <motion.img
          src="/logo.png"
          alt="EasyWeather"
          style={{
            display: "block",
            position: "relative",
            margin: `${logoTop}px auto 16px`,
            width: 130,
            maxWidth: "80vw",
            zIndex: 99,
            height: "auto"
          }}
          animate={{
            scale: [1, 1.08, 0.97, 1],
            rotate: [0, 4, -2, 0],
            y: [0, -7, 0, 3, 0]
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* --- ФОРМА ГОРОД+ДАТА --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.22 }
            }
          }}
          style={{ maxWidth: 340, margin: "0px auto 0", textAlign: 'center', zIndex: 99 }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            {renderCityLabel}
            <CityDateInput
              city={city}
              setCity={setCity}
              date={date}
              setDate={setDate}
              disabled={loading}
            />
          </motion.div>

          {/* --- КНОПКИ --- */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleShowWeather}
              disabled={loading}
              sx={{
                marginTop: 1,
                marginBottom: 0,
                borderRadius: 3,
                height: 46,
                fontSize: 20,
                fontWeight: 500,
                textTransform: "none",
                fontFamily: "Montserrat, Arial, sans-serif"
              }}
            >
              {loading ? <CircularProgress color="inherit" size={24} /> : 'Показать погоду'}
            </Button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              sx={{
                mt: 1,
                color: "#fff",
                borderRadius: 3,
                fontSize: 20,
                fontWeight: 500,
                textTransform: "none",
                height: 46,
                fontFamily: "Montserrat, Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textShadow: "0 2px 8px rgba(0,0,0,0.37), 0 0 1px #fff",
                gap: 1,
              }}
              onClick={handleGeoWeather}
              disabled={loading}
            >
              <span>Погода по геолокации</span>
                <svg
                  style={{ marginLeft: 8, minWidth: 22 }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.7"/>
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.7"/>
                  <circle cx="12" cy="12" r="1.7" fill="#2498dc"/>
                </svg>
            </Button>
          </motion.div>
        </motion.div>

        <div style={{ height: 24 }} />

        {/* --- КАРТОЧКА ПОГОДЫ --- */}
        {weather && (
          <div style={{ marginTop: "-15px" }}>
            <WeatherCard {...weather} isNight={isNight} forecast={forecast} photoUrl={photoUrl} />
          </div>
        )}

        <AdBanner />
      </motion.div>
    </ThemeProvider>
  );
}

export default App;















