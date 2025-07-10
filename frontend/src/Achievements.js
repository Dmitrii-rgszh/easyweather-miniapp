// Achievements.js с унифицированной шириной блоков

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Система достижений и очков
const ACHIEVEMENTS = {
  firstCheck: {
    id: 'firstCheck',
    title: 'Новичок',
    description: 'Первая проверка погоды',
    icon: '🌤️',
    points: 10,
    condition: (stats) => stats.totalChecks >= 1
  },
  weekStreak: {
    id: 'weekStreak',
    title: 'Постоянный',
    description: '7 дней подряд',
    icon: '📅',
    points: 50,
    condition: (stats) => stats.consecutiveDays >= 7
  },
  monthStreak: {
    id: 'monthStreak',
    title: 'Метеоролог',
    description: '30 дней подряд',
    icon: '🌦️',
    points: 200,
    condition: (stats) => stats.consecutiveDays >= 30
  },
  extremeWeather: {
    id: 'extremeWeather',
    title: 'Погодный воин',
    description: 'Проверка в экстремальную погоду',
    icon: '⛈️',
    points: 25,
    condition: (stats) => stats.extremeWeatherChecks >= 1
  },
  earlyBird: {
    id: 'earlyBird',
    title: 'Ранняя пташка',
    description: 'Проверка до 7 утра',
    icon: '🌅',
    points: 15,
    condition: (stats) => stats.earlyChecks >= 5
  },
  nightOwl: {
    id: 'nightOwl',
    title: 'Полуночник',
    description: 'Проверка после 11 вечера',
    icon: '🌙',
    points: 15,
    condition: (stats) => stats.lateChecks >= 5
  }
};

// Уровни пользователя
const USER_LEVELS = [
  { level: 1, title: 'Новичок', minPoints: 0, icon: '🌱', color: '#10b981' },
  { level: 2, title: 'Любитель', minPoints: 50, icon: '☀️', color: '#f59e0b' },
  { level: 3, title: 'Энтузиаст', minPoints: 150, icon: '🌤️', color: '#3b82f6' },
  { level: 4, title: 'Эксперт', minPoints: 300, icon: '⛅', color: '#8b5cf6' },
  { level: 5, title: 'Метеоролог', minPoints: 500, icon: '🌦️', color: '#ec4899' },
  { level: 6, title: 'Мастер погоды', minPoints: 1000, icon: '⛈️', color: '#ef4444' }
];

// Функции для работы с localStorage
const getGameStats = () => {
  const saved = localStorage.getItem('gameProgress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка загрузки прогресса:', e);
    }
  }
  
  return {
    totalPoints: 0,
    totalChecks: 0,
    consecutiveDays: 0,
    lastCheckDate: null,
    unlockedAchievements: [],
    extremeWeatherChecks: 0,
    earlyChecks: 0,
    lateChecks: 0
  };
};

const saveGameStats = (stats) => {
  try {
    localStorage.setItem('gameProgress', JSON.stringify(stats));
    // Отправляем событие обновления статистики
    window.dispatchEvent(new CustomEvent('statsUpdated', { detail: stats }));
  } catch (e) {
    console.error('Ошибка сохранения прогресса:', e);
  }
};

// Функция записи проверки погоды
const recordWeatherCheck = (weather) => {
  const stats = getGameStats();
  const now = new Date();
  const today = now.toDateString();
  
  // Обновляем статистику
  stats.totalChecks += 1;
  
  // Проверяем последовательные дни
  if (stats.lastCheckDate) {
    const lastDate = new Date(stats.lastCheckDate);
    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      stats.consecutiveDays += 1;
    } else if (daysDiff > 1) {
      stats.consecutiveDays = 1;
    }
  } else {
    stats.consecutiveDays = 1;
  }
  
  stats.lastCheckDate = today;
  
  // Проверяем экстремальную погоду
  if (weather && (weather.temp < -15 || weather.temp > 35 || weather.wind_speed > 15)) {
    stats.extremeWeatherChecks += 1;
  }
  
  // Проверяем время
  const hour = now.getHours();
  if (hour < 7) {
    stats.earlyChecks += 1;
  } else if (hour >= 23) {
    stats.lateChecks += 1;
  }
  
  // Проверяем достижения
  checkAchievements(stats);
  
  saveGameStats(stats);
  return stats;
};

// Проверка достижений
const checkAchievements = (stats) => {
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!stats.unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
      stats.unlockedAchievements.push(achievement.id);
      stats.totalPoints += achievement.points;
      
      // Отправляем событие нового достижения
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('newAchievement', { 
          detail: { achievement: achievement.id } 
        }));
      }, 1000);
    }
  });
};

// Получение текущего уровня пользователя
const getUserLevel = (points) => {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= USER_LEVELS[i].minPoints) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
};

// Получение прогресса до следующего уровня
const getProgressToNextLevel = (points) => {
  const currentLevel = getUserLevel(points);
  const nextLevel = USER_LEVELS.find(level => level.minPoints > points);
  
  if (!nextLevel) {
    return { progress: 100, pointsNeeded: 0, nextLevel: null };
  }
  
  const pointsInCurrentLevel = points - currentLevel.minPoints;
  const pointsNeededForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
  const progress = Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
  
  return {
    progress,
    pointsNeeded: nextLevel.minPoints - points,
    nextLevel
  };
};

// Компонент уведомления о достижении
const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  const achievementData = ACHIEVEMENTS[achievement];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      style={{
        position: 'fixed',
        top: 80,
        right: 16,
        background: 'linear-gradient(135deg, #10b981, #34d399)',
        color: 'white',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 9999,
        maxWidth: 280,
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 24, marginRight: 8 }}>{achievementData.icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Достижение разблокировано!</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{achievementData.title}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>
        {achievementData.description}
      </div>
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '4px 8px', 
        borderRadius: 6, 
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center'
      }}>
        +{achievementData.points} очков! 🎉
      </div>
    </motion.div>
  );
};

// Основной компонент достижений
const Achievements = ({ stats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const userLevel = getUserLevel(stats.totalPoints);
  const levelProgress = getProgressToNextLevel(stats.totalPoints);
  
  const unlockedCount = stats.unlockedAchievements.length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 16,
      padding: 16,
      margin: "16px auto 0", // ← ИСПРАВЛЕНО: теперь как у других блоков
      maxWidth: 340, // ← ДОБАВЛЕНО: ограничение ширины как у других блоков
      width: "100%", // ← ДОБАВЛЕНО: полная ширина в рамках maxWidth
      boxSizing: "border-box", // ← ДОБАВЛЕНО: правильный расчет размеров
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: '#1e293b',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}>
          {userLevel.icon} Прогресс
        </h3>
        
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}
        >
          {showDetails ? 'Скрыть' : 'Подробнее'}
        </motion.button>
      </div>

      {/* Уровень и очки */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: userLevel.color,
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            {userLevel.title} (Уровень {userLevel.level})
          </div>
          <div style={{
            fontSize: 12,
            color: '#64748b',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            {stats.totalPoints} очков
          </div>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            fontSize: 12,
            color: '#64748b',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            Достижения
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1e293b',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}>
            {unlockedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Прогресс-бар до следующего уровня */}
      {levelProgress.nextLevel && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <span style={{
              fontSize: 10,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              До {levelProgress.nextLevel.title}
            </span>
            <span style={{
              fontSize: 10,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              {levelProgress.pointsNeeded} очков
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: 6,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${userLevel.color}, ${levelProgress.nextLevel.color})`,
                borderRadius: 3
              }}
            />
          </div>
        </div>
      )}

      {/* Детальная информация */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 8,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                Статистика:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{stats.totalChecks}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Проверок</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{stats.consecutiveDays}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Дней подряд</div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: 8,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Достижения:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6
                }}>
                  {Object.values(ACHIEVEMENTS).map(achievement => {
                    const isUnlocked = stats.unlockedAchievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        style={{
                          textAlign: 'center',
                          padding: 6,
                          borderRadius: 8,
                          background: isUnlocked 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          opacity: isUnlocked ? 1 : 0.5
                        }}
                      >
                        <div style={{ fontSize: 16, marginBottom: 2 }}>
                          {achievement.icon}
                        </div>
                        <div style={{
                          fontSize: 8,
                          fontWeight: 600,
                          color: isUnlocked ? '#10b981' : '#64748b',
                          fontFamily: 'Montserrat, Arial, sans-serif'
                        }}>
                          {achievement.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Компонент-обертка с уведомлениями
export default function AchievementsSystem() {
  const [stats, setStats] = useState(getGameStats());
  const [notification, setNotification] = useState(null);

  // Слушаем события новых достижений
  useEffect(() => {
    const handleNewAchievement = (event) => {
      setNotification(event.detail.achievement);
    };

    window.addEventListener('newAchievement', handleNewAchievement);
    return () => window.removeEventListener('newAchievement', handleNewAchievement);
  }, []);

  useEffect(() => {
    const handleStatsUpdate = () => {
      setStats(getGameStats());
    };

    // Слушаем события обновления статистики
    window.addEventListener('statsUpdated', handleStatsUpdate);
    
    // Также обновляем статистику при получении достижений
    const handleNewAchievement = (event) => {
      setNotification(event.detail.achievement);
      setStats(getGameStats()); // Обновляем статистику
    };

    window.addEventListener('newAchievement', handleNewAchievement);
    
    return () => {
      window.removeEventListener('newAchievement', handleNewAchievement);
      window.removeEventListener('statsUpdated', handleStatsUpdate);
    };
  }, []);

  return (
    <>
      <Achievements stats={stats} />
      
      <AnimatePresence>
        {notification && (
          <AchievementNotification
            achievement={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Экспортируем функции для использования в других компонентах
export { recordWeatherCheck, getGameStats, Achievements, AchievementNotification };