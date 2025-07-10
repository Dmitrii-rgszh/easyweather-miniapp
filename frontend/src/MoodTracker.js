// MoodTracker.js - Трекер настроения с плавающей кнопкой
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Функция сохранения записи настроения
function saveMoodEntry(mood, weather, city) {
  try {
    const existingHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      mood: mood,
      weather: {
        city: city,
        temp: weather.temp,
        desc: weather.desc,
        humidity: weather.details?.humidity,
        pressure: weather.details?.pressure,
        wind: weather.details?.wind
      }
    };
    
    // Добавляем новую запись в начало массива
    const updatedHistory = [newEntry, ...existingHistory];
    
    // Оставляем только последние 30 записей для экономии места
    const trimmedHistory = updatedHistory.slice(0, 30);
    
    localStorage.setItem('moodHistory', JSON.stringify(trimmedHistory));
    
    console.log('😊 Настроение сохранено:', newEntry);
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения настроения:', error);
    return false;
  }
}

// Функция получения статистики настроения
function getMoodStats() {
  try {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    // Проверяем, записывал ли пользователь настроение сегодня
    const todayEntry = history.find(entry => entry.date === today);
    
    return {
      totalEntries: history.length,
      todayRecorded: !!todayEntry,
      lastEntry: history[0] || null,
      weeklyEntries: history.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length
    };
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return { totalEntries: 0, todayRecorded: false, lastEntry: null, weeklyEntries: 0 };
  }
}

// Компонент выбора настроения
const MoodSelector = ({ onSelect, onClose }) => {
  const moods = [
    { 
      id: 'excellent', 
      emoji: '😊', 
      label: 'Отлично', 
      color: '#10b981',
      description: 'Прекрасное настроение!' 
    },
    { 
      id: 'normal', 
      emoji: '😐', 
      label: 'Нормально', 
      color: '#f59e0b',
      description: 'Обычное состояние' 
    },
    { 
      id: 'bad', 
      emoji: '😔', 
      label: 'Плохо', 
      color: '#ef4444',
      description: 'Не очень хорошо' 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 400,
        duration: 0.4 
      }}
      style={{
        position: "fixed",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.3)",
        zIndex: 2000,
        maxWidth: "320px",
        width: "90%"
      }}
    >
      {/* Заголовок */}
      <div style={{
        textAlign: "center",
        marginBottom: "16px"
      }}>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#374151",
          fontFamily: "Montserrat, Arial, sans-serif",
          margin: "0 0 4px 0"
        }}>
          Как ваше настроение?
        </h3>
        <p style={{
          fontSize: "12px",
          color: "#6b7280",
          fontFamily: "Montserrat, Arial, sans-serif",
          margin: 0
        }}>
          Помогите нам понять влияние погоды на эмоции
        </p>
      </div>

      {/* Варианты настроения */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "12px"
      }}>
        {moods.map((mood, index) => (
          <motion.button
            key={mood.id}
            onClick={() => onSelect(mood)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              boxShadow: `0 8px 25px ${mood.color}30`
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 8px",
              background: `${mood.color}15`,
              border: `2px solid ${mood.color}30`,
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "Montserrat, Arial, sans-serif"
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>
              {mood.emoji}
            </div>
            <div style={{
              fontSize: "12px",
              fontWeight: "600",
              color: mood.color,
              marginBottom: "2px"
            }}>
              {mood.label}
            </div>
            <div style={{
              fontSize: "9px",
              color: "#6b7280",
              textAlign: "center",
              lineHeight: "1.2"
            }}>
              {mood.description}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Кнопка закрытия */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: "100%",
          padding: "8px",
          background: "rgba(107, 114, 128, 0.1)",
          border: "1px solid rgba(107, 114, 128, 0.2)",
          borderRadius: "12px",
          fontSize: "12px",
          color: "#6b7280",
          cursor: "pointer",
          fontFamily: "Montserrat, Arial, sans-serif"
        }}
      >
        Пропустить
      </motion.button>
    </motion.div>
  );
};

// Компонент уведомления об успешном сохранении
const SuccessNotification = ({ mood, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 400 
      }}
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}25)`,
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "16px 20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: `1px solid ${mood.color}40`,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}
    >
      <div style={{ fontSize: "24px" }}>
        {mood.emoji}
      </div>
      <div>
        <div style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
          fontFamily: "Montserrat, Arial, sans-serif",
          marginBottom: "2px"
        }}>
          Настроение записано!
        </div>
        <div style={{
          fontSize: "12px",
          color: "#6b7280",
          fontFamily: "Montserrat, Arial, sans-serif"
        }}>
          {mood.label} • Спасибо за участие ✨
        </div>
      </div>
    </motion.div>
  );
};

// Основной компонент трекера настроения
export default function MoodTracker({ 
  weather, 
  city, 
  isVisible = true, 
  context = null, 
  onClose = null, 
  onSuccess = null 
}) {
  const [showSelector, setShowSelector] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodStats, setMoodStats] = useState({ totalEntries: 0, todayRecorded: false, weeklyEntries: 0 });

  // Загружаем статистику при монтировании
  useEffect(() => {
    const stats = getMoodStats();
    setMoodStats(stats);
  }, []);

  // Обновляем статистику когда изменяется видимость
  useEffect(() => {
    if (isVisible) {
      const stats = getMoodStats();
      setMoodStats(stats);
    }
  }, [isVisible]);

  // Обработка выбора настроения
  const handleMoodSelect = (mood) => {
    const success = saveMoodEntry(mood.id, weather, city);
    
    if (success) {
      setSelectedMood(mood);
      setShowSelector(false);
      setShowSuccess(true);
      
      // Обновляем статистику
      const updatedStats = getMoodStats();
      setMoodStats(updatedStats);

      // 🆕 ВЫЗЫВАЕМ CALLBACK УСПЕХА
      if (onSuccess) {
        onSuccess({
          mood: mood.id,
          city: city,
          weather: weather,
          context: context
        });
      }
    }
  };

  // Не показываем если нет данных о погоде или уже записано сегодня
  if (!isVisible || !weather || moodStats.todayRecorded) {
    return null;
  }

  return (
    <>
      {/* Плавающая кнопка трекера */}
      <AnimatePresence>
        {!showSelector && !showSuccess && (
          <motion.button
            onClick={() => setShowSelector(true)}
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            whileHover={{ 
              scale: 1.1, 
              y: -5,
              boxShadow: "0 15px 35px rgba(139, 92, 246, 0.4)"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 400,
              delay: 1.5 // Появляется через 1.5 секунды после загрузки погоды
            }}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)"
            }}
          >
            {/* Пульсирующий эффект */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.4, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                zIndex: -1
              }}
            />
            
            {/* Иконка */}
            <span style={{ fontSize: "24px" }}>😊</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Селектор настроения */}
      <AnimatePresence>
        {showSelector && (
          <MoodSelector
            onSelect={handleMoodSelect}
            onClose={() => setShowSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Уведомление об успешном сохранении */}
      <AnimatePresence>
        {showSuccess && selectedMood && (
          <SuccessNotification
            mood={selectedMood}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}