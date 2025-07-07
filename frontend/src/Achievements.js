// Achievements.js - Система достижений и геймификации
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Список всех достижений
const ACHIEVEMENTS = {
  first_check: {
    id: 'first_check',
    title: 'Новичок',
    description: 'Первая проверка погоды',
    icon: '🌤️',
    points: 10,
    condition: (stats) => stats.totalChecks >= 1
  },
  daily_user: {
    id: 'daily_user',
    title: 'Постоянный клиент',
    description: '7 дней подряд',
    icon: '🗓️',
    points: 50,
    condition: (stats) => stats.consecutiveDays >= 7
  },
  weather_expert: {
    id: 'weather_expert',
    title: 'Метеоролог',
    description: '30 дней подряд',
    icon: '🌡️',
    points: 200,
    condition: (stats) => stats.consecutiveDays >= 30
  },
  storm_chaser: {
    id: 'storm_chaser',
    title: 'Охотник за штормами',
    description: 'Проверка при экстремальной погоде',
    icon: '⛈️',
    points: 30,
    condition: (stats) => stats.extremeWeatherChecks >= 1
  },
  early_bird: {
    id: 'early_bird',
    title: 'Ранняя пташка',
    description: 'Проверка погоды до 7 утра',
    icon: '🌅',
    points: 25,
    condition: (stats) => stats.earlyChecks >= 1
  },
  night_owl: {
    id: 'night_owl',
    title: 'Сова',
    description: 'Проверка погоды после 23:00',
    icon: '🦉',
    points: 25,
    condition: (stats) => stats.lateChecks >= 1
  },
  globe_trotter: {
    id: 'globe_trotter',
    title: 'Путешественник',
    description: 'Проверка погоды в 10 разных городах',
    icon: '🌍',
    points: 100,
    condition: (stats) => stats.uniqueCities.length >= 10
  },
  premium_user: {
    id: 'premium_user',
    title: 'VIP клиент',
    description: 'Активация Premium',
    icon: '💎',
    points: 500,
    condition: (stats) => stats.isPremium
  }
};

// Уровни пользователя
const LEVELS = [
  { level: 1, minPoints: 0, title: 'Новичок', color: '#94a3b8', icon: '🌱' },
  { level: 2, minPoints: 50, title: 'Любитель', color: '#3b82f6', icon: '🌿' },
  { level: 3, minPoints: 150, title: 'Знаток', color: '#10b981', icon: '🌳' },
  { level: 4, minPoints: 300, title: 'Эксперт', color: '#f59e0b', icon: '⭐' },
  { level: 5, minPoints: 600, title: 'Мастер', color: '#ef4444', icon: '🏆' },
  { level: 6, minPoints: 1000, title: 'Легенда', color: '#8b5cf6', icon: '👑' }
];

// Функции для работы с достижениями
export function getGameStats() {
  try {
    const stats = localStorage.getItem('gameStats');
    return stats ? JSON.parse(stats) : {
      totalPoints: 0,
      totalChecks: 0,
      consecutiveDays: 0,
      lastCheckDate: null,
      extremeWeatherChecks: 0,
      earlyChecks: 0,
      lateChecks: 0,
      uniqueCities: [],
      unlockedAchievements: [],
      isPremium: false
    };
  } catch {
    return {
      totalPoints: 0,
      totalChecks: 0,
      consecutiveDays: 0,
      lastCheckDate: null,
      extremeWeatherChecks: 0,
      earlyChecks: 0,
      lateChecks: 0,
      uniqueCities: [],
      unlockedAchievements: [],
      isPremium: false
    };
  }
}

export function saveGameStats(stats) {
  try {
    localStorage.setItem('gameStats', JSON.stringify(stats));
  } catch (error) {
    console.error('Ошибка сохранения статистики игры:', error);
  }
}

export function recordWeatherCheck(city, weather, isPremium = false) {
  const stats = getGameStats();
  const now = new Date();
  const today = now.toDateString();
  const hour = now.getHours();
  
  // Увеличиваем общее количество проверок
  stats.totalChecks++;
  
  // Проверяем последовательные дни
  if (stats.lastCheckDate === today) {
    // Уже проверяли сегодня, не увеличиваем счетчик
  } else if (stats.lastCheckDate === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
    // Вчера проверяли, продолжаем серию
    stats.consecutiveDays++;
  } else {
    // Прерван цикл, начинаем заново
    stats.consecutiveDays = 1;
  }
  
  stats.lastCheckDate = today;
  
  // Проверяем уникальные города
  if (!stats.uniqueCities.includes(city)) {
    stats.uniqueCities.push(city);
  }
  
  // Проверяем экстремальную погоду
  if (weather && (
    weather.temp <= -10 || weather.temp >= 35 ||
    weather.desc.includes('гроза') || weather.desc.includes('шторм') ||
    weather.desc.includes('снег')
  )) {
    stats.extremeWeatherChecks++;
  }
  
  // Проверяем время
  if (hour < 7) {
    stats.earlyChecks++;
  } else if (hour >= 23) {
    stats.lateChecks++;
  }
  
  // Обновляем Premium статус
  stats.isPremium = isPremium;
  
  // Проверяем новые достижения
  const newAchievements = checkNewAchievements(stats);
  
  // Добавляем очки за новые достижения
  newAchievements.forEach(achievement => {
    stats.totalPoints += ACHIEVEMENTS[achievement].points;
    if (!stats.unlockedAchievements.includes(achievement)) {
      stats.unlockedAchievements.push(achievement);
    }
  });
  
  // Базовые очки за проверку
  stats.totalPoints += 5;
  
  saveGameStats(stats);
  
  return {
    stats,
    newAchievements,
    pointsEarned: 5 + newAchievements.reduce((sum, id) => sum + ACHIEVEMENTS[id].points, 0)
  };
}

function checkNewAchievements(stats) {
  const newAchievements = [];
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!stats.unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
      newAchievements.push(achievement.id);
    }
  });
  
  return newAchievements;
}

export function getUserLevel(points) {
  let userLevel = LEVELS[0];
  
  for (const level of LEVELS) {
    if (points >= level.minPoints) {
      userLevel = level;
    } else {
      break;
    }
  }
  
  return userLevel;
}

export function getProgressToNextLevel(points) {
  const currentLevel = getUserLevel(points);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  
  if (nextLevelIndex >= LEVELS.length) {
    return { progress: 100, pointsNeeded: 0, nextLevel: null };
  }
  
  const nextLevel = LEVELS[nextLevelIndex];
  const pointsInCurrentLevel = points - currentLevel.minPoints;
  const pointsNeededForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
  const progress = Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
  
  return {
    progress,
    pointsNeeded: nextLevel.minPoints - points,
    nextLevel
  };
}

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
      margin: '10px 0',
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
              До уровня {levelProgress.nextLevel.level}
            </span>
            <span style={{
              fontSize: 10,
              color: '#64748b',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}>
              -{levelProgress.pointsNeeded} очков
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
              transition={{ duration: 1, ease: 'easeOut' }}
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: 12,
              marginTop: 12
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                marginBottom: 12
              }}>
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
  const [stats] = useState(getGameStats());
  const [notification, setNotification] = useState(null);

  // Слушаем события новых достижений
  useEffect(() => {
    const handleNewAchievement = (event) => {
      setNotification(event.detail.achievement);
    };

    window.addEventListener('newAchievement', handleNewAchievement);
    return () => window.removeEventListener('newAchievement', handleNewAchievement);
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

// Экспортируем также компонент достижений отдельно
export { Achievements, AchievementNotification };