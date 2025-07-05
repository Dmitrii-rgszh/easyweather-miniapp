import { Card, Typography } from '@mui/material';
import { motion } from "framer-motion";

function WeatherCard({ city, temp, desc, icon, details, forecast, photoUrl }) {
  console.log('>>> WeatherCard props:', { city, temp, desc, icon, details, forecast, photoUrl });
  // Цвета:
  const tempBlue = "#2498dc";
  const cardBg = "#e9f1f8";

  return (
    <Card
      style={{
        margin: "0 auto",
        maxWidth: 300,
        maxHeight: 360,
        borderRadius: 24,
        background: "rgba(255,255,255,0.1)",
        boxShadow: "100 8px 32px #38bdf833",
        background: cardBg,
        color: "#232942",
        backdropFilter: "blur(120px)",
        position: "relative",
        padding: "18px 18px 18px",
        overflow: "hidden",
        top: 0
      }}
    >
      {/* Прозрачная фотография-подложка */}
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
            opacity: 0.18,
            filter: "blur(3px)",
            pointerEvents: "none",
            transition: "opacity 0.3s"
          }}
        />
      )}

      {/* Весь контент поверх фото */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Typography variant="h5" align="center" sx={{ letterSpacing: 3, fontWeight: 600 }}>
          {city}
        </Typography>

        {/* Круглый фон под иконкой */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "14px auto 2px",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #38bdf8 0%, #bae6fd 100%)",
          boxShadow: "0 2px 12px #c7e0f533"
        }}>
          <img
            src={icon}
            alt={desc}
            style={{
              width: 76,
              height: 76,
              display: "block"
            }}
          />
        </div>

        {/* Температура */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            margin: 0,
            color: tempBlue,
            letterSpacing: 3,
          }}
        >
          {temp}°
        </Typography>

        {/* Описание погоды */}
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            marginTop: "0px",
            marginBottom: forecast && forecast.length > 0 ? "4px" : "10px",
            fontWeight: 500,
            textAlign: "center"
          }}
        >
          {desc}
        </Typography>

        {/* Карусель прогноза */}
        {forecast && forecast.length > 0 && (
          <motion.div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              margin: "0 auto 12px",
              justifyContent: "center",
              padding: "6px 0",
              WebkitOverflowScrolling: "touch"
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            {forecast.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f6faff",
                  borderRadius: 16,
                  minWidth: 64,
                  padding: "7px 7px",
                  boxShadow: "0 2px 10px #c7e0f511",
                  textAlign: "center"
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 15 }}>{item.time}</div>
                {/* СЮДА: голубой фон для иконки */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #38bdf8 0%, #bae6fd 100%)"
                  }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    style={{ width: 42, height: 42, display: "block" }}
                  />
                </div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{item.temp}°</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Детали (ощущается, давление, влажность, ветер) */}
        {details && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
            gap: 8
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Ощущается</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{details.feels}°</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Давление</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{details.pressure} мм</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Влажность</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{details.humidity}%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Ветер</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{details.wind}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default WeatherCard;











