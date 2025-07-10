import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем реальные функции геймификации
const USER_LEVELS = [
  { level: 1, title: 'Новичок', icon: '🌱', color: '#3b82f6', minPoints: 0 },
  { level: 2, title: 'Любитель', icon: '🌿', color: '#10b981', minPoints: 100 },
  { level: 3, title: 'Знаток', icon: '🌳', color: '#059669', minPoints: 300 },
  { level: 4, title: 'Эксперт', icon: '⭐', color: '#f59e0b', minPoints: 600 },
  { level: 5, title: 'Мастер', icon: '👑', color: '#8b5cf6', minPoints: 1000 }
];

const ACHIEVEMENTS = {
  first_check: { icon: '🌟', title: 'Первый взгляд', points: 10 },
  daily_user: { icon: '☀️', title: 'Утренний ритуал', points: 25 },
  weather_warrior: { icon: '⚡', title: 'Погодный воин', points: 50 },
  week_streak: { icon: '🔥', title: 'Неделя подряд', points: 100 },
  explorer: { icon: '🗺️', title: 'Исследователь', points: 75 },
  night_owl: { icon: '🦉', title: 'Сова', points: 30 }
};

// Функции геймификации (как в реальном Achievements.js)
const getUserLevel = (points) => {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= USER_LEVELS[i].minPoints) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
};

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

// Функция получения реальных статистик (как в реальном компоненте)
const getGameStats = () => {
  try {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Ошибка чтения gameStats:', e);
  }
  
  return {
    totalPoints: 0,
    unlockedAchievements: [],
    weatherChecks: 0,
    citiesExplored: [],
    longestStreak: 0,
    currentStreak: 0,
    lastCheckDate: null,
    extremeWeatherChecks: 0,
    earlyChecks: 0,
    lateChecks: 0
  };
};

// Компонент частиц для эффекта магии
const MagicParticles = ({ isActive, color }) => {
  const particles = Array.from({ length: 8 }, (_, i) => i);
  
  return (
    <AnimatePresence>
      {isActive && particles.map((particle) => (
        <motion.div
          key={particle}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: [0, (Math.random() - 0.5) * 50],
            y: [0, -25 - Math.random() * 15]
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 1.8,
            delay: particle * 0.08,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            background: color || '#60a5fa',
            borderRadius: '50%',
            left: '50%',
            top: '50%',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: `0 0 6px ${color || '#60a5fa'}`
          }}
        />
      ))}
    </AnimatePresence>
  );
};

// Компонент мягкого свечения в стиле EasyWeather
const SoftGlow = ({ color, isActive }) => (
  <motion.div
    animate={isActive ? {
      opacity: [0.4, 0.7, 0.4],
      scale: [1, 1.05, 1]
    } : {
      opacity: 0.2
    }}
    transition={{
      duration: 2.5,
      repeat: isActive ? Infinity : 0,
      ease: "easeInOut"
    }}
    style={{
      position: 'absolute',
      inset: '-6px',
      background: `radial-gradient(ellipse, ${color}25 0%, ${color}15 40%, transparent 70%)`,
      borderRadius: '20px',
      zIndex: -1,
      filter: 'blur(4px)'
    }}
  />
);

// Главный компонент HeaderAchievements
const HeaderAchievements = ({ gameStats: propStats }) => {
  // Используем переданную статистику или загружаем из localStorage
  const [stats, setStats] = useState(propStats || getGameStats());
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [lastPoints, setLastPoints] = useState(stats.totalPoints);
  
  const userLevel = getUserLevel(stats.totalPoints);
  const levelProgress = getProgressToNextLevel(stats.totalPoints);
  
  // Обновляем статистику при изменении пропса
  useEffect(() => {
    if (propStats) {
      setStats(propStats);
      
      // Показываем частицы при получении новых очков
      if (propStats.totalPoints > lastPoints) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
        setLastPoints(propStats.totalPoints);
      }
    }
  }, [propStats, lastPoints]);
  
  // Слушаем события обновления статистики
  useEffect(() => {
    const handleStatsUpdate = () => {
      const newStats = getGameStats();
      
      // Показываем эффект при получении новых очков
      if (newStats.totalPoints > stats.totalPoints) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
      }
      
      setStats(newStats);
    };

    window.addEventListener('statsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('statsUpdated', handleStatsUpdate);
  }, [stats.totalPoints]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%', // Точно такая же ширина как у кнопки
        margin: '12px auto',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '8px 16px', // Уменьшили правый отступ для точного соответствия кнопке
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box', // ✅ Добавили для правильного расчета ширины
        boxShadow: isHovered 
          ? '0 8px 32px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(255,255,255,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-1px) scale(1.01)' : 'translateY(0) scale(1)',
        border: '1px solid rgba(255,255,255,0.6)'
      }}
    >
      {/* Мягкое свечение в стиле EasyWeather */}
      <SoftGlow color={userLevel.color} isActive={isHovered} />
      
      {/* Частицы */}
      <MagicParticles isActive={showParticles} color={userLevel.color} />
      
      {/* Левая часть - уровень */}
      <motion.div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
        animate={isHovered ? { x: [0, 1, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${userLevel.color}f0, ${userLevel.color}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '25px',
            boxShadow: `0 4px 12px ${userLevel.color}30`,
            position: 'relative',
            border: `2px solid rgba(255,255,255,0.8)`
          }}
          animate={isHovered ? {
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.span
            animate={showParticles ? {
              scale: [1, 1.3, 1],
              rotate: [0, 360]
            } : isHovered ? {
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: showParticles ? 1 : 0.4 }}
          >
            {userLevel.icon}
          </motion.span>
          
          {/* Кольцо прогресса */}
          <svg 
            style={{ 
              position: 'absolute', 
              width: '50px', 
              height: '50px',
              top: '-4px',
              left: '-4px',
              transform: 'rotate(-90deg)'
            }}
          >
            <circle
              cx="25"
              cy="25"
              r="22"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              fill="none"
            />
            <motion.circle
              cx="25"
              cy="25"
              r="22"
              stroke={userLevel.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray="138.2"
              initial={{ strokeDashoffset: 138.2 }}
              animate={{ 
                strokeDashoffset: 138.2 - (levelProgress.progress / 100) * 138.2 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 3px ${userLevel.color}60)`
              }}
            />
          </svg>
        </motion.div>
        
        <div>
          <motion.div 
            style={{ 
              fontSize: '16px', // Увеличили с 13px до 15px
              fontWeight: '700',
              background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}
            animate={isHovered ? { x: [0, 2, 0] } : {}}
          >
            {userLevel.title}
          </motion.div>
          <motion.div 
            style={{ 
              fontSize: '14px', // Увеличили с 10px до 12px
              color: '#64748b',
              lineHeight: '1.3',
              fontFamily: 'Montserrat, Arial, sans-serif',
              marginTop: '2px'
            }}
            animate={isHovered ? { x: [0, 2, 0] } : {}}
            transition={{ delay: 0.05 }}
          >
            <motion.span
              key={stats.totalPoints}
              initial={{ scale: 1.2, color: userLevel.color }}
              animate={{ scale: 1, color: '#64748b' }}
              transition={{ duration: 0.4 }}
            >
              {stats.totalPoints.toLocaleString()}
            </motion.span> очков
          </motion.div>
        </div>
      </motion.div>
      
      {/* Центр - элегантный прогресс-бар */}
      <div style={{ flex: 1, margin: '0 16px', position: 'relative' }}>
        <motion.div
          style={{
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.05))',
            borderRadius: '3px',
            overflow: 'hidden',
            position: 'relative'
          }}
          whileHover={{ height: '8px' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${levelProgress.progress}%` }}
            style={{
              height: '100%',
              background: levelProgress.nextLevel 
                ? `linear-gradient(90deg, ${userLevel.color}dd, ${levelProgress.nextLevel.color}dd)`
                : `linear-gradient(90deg, ${userLevel.color}dd, ${userLevel.color}aa)`,
              borderRadius: '3px',
              position: 'relative',
              boxShadow: `0 0 8px ${userLevel.color}40`
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut"
            }}
          >
            {/* Мягкий блеск */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: '-15px',
                width: '15px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                borderRadius: '3px'
              }}
              animate={isHovered ? {
                x: ['0px', '150px']
              } : {}}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 3
              }}
            />
          </motion.div>
        </motion.div>
        
      </div>
      
      {/* Правая часть - достижения */}
      <motion.div 
        style={{ textAlign: 'right', position: 'relative' }}
        animate={isHovered ? { x: [0, -1, 0] } : {}}
      >
        <motion.div 
          style={{ 
            fontSize: '17px', // Увеличили с 13px до 15px
            fontWeight: '700',
            color: '#374151',
            lineHeight: '1',
            fontFamily: 'Montserrat, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            justifyContent: 'flex-end'
          }}
        >
          <motion.span
            animate={isHovered ? {
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.6 }}
            style={{ fontSize: '17px' }} // Увеличили иконку с 12px до 14px
          >
            🏆
          </motion.span>
          <motion.span
            key={stats.unlockedAchievements.length}
            initial={{ scale: 1.2, color: '#f59e0b' }}
            animate={{ scale: 1, color: '#374151' }}
            transition={{ duration: 0.4 }}
          >
            {stats.unlockedAchievements.length}
          </motion.span>
          <span style={{ opacity: 0.6, fontSize: '17px' }}>/{Object.keys(ACHIEVEMENTS).length}</span> {/* Увеличили с 11px до 13px */}
        </motion.div>
        
        <motion.div 
          style={{ 
            fontSize: '14px', // Увеличили с 10px до 12px
            color: '#64748b',
            lineHeight: '1.3',
            fontFamily: 'Montserrat, Arial, sans-serif',
            marginTop: '2px'
          }}
        >
          достижений
        </motion.div>
        
        {/* Мини-достижения при наведении */}
        <AnimatePresence>
          {isHovered && stats.unlockedAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                display: 'flex',
                gap: '3px',
                background: 'rgba(255,255,255,0.98)',
                padding: '8px',
                borderRadius: '10px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                zIndex: 20,
                border: '1px solid rgba(255,255,255,0.8)'
              }}
            >
              {stats.unlockedAchievements.slice(-5).map((id, index) => (
                <motion.div
                  key={id}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 300
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    background: `linear-gradient(135deg, ${userLevel.color}f0, ${userLevel.color}dd)`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    boxShadow: `0 2px 8px ${userLevel.color}30`,
                    border: '1px solid rgba(255,255,255,0.8)'
                  }}
                >
                  {ACHIEVEMENTS[id]?.icon || '🏆'}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Индикатор стрика */}
      {stats.currentStreak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '-6px',
            right: '12px',
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            color: 'white',
            fontSize: '10px', // Увеличили с 8px до 10px
            fontWeight: '700',
            padding: '3px 6px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
            fontFamily: 'Montserrat, Arial, sans-serif',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          🔥 {stats.currentStreak}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HeaderAchievements;