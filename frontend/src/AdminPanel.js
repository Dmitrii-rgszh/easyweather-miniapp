import React, { useState, useEffect } from 'react';

// 📊 Компонент серверной аналитики баннера
// 📊 УЛУЧШЕННЫЙ Компонент серверной аналитики баннера с графиками
const BannerAnalytics = ({ adminData }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем статистику с сервера
  const loadStats = async () => {
    if (!adminData?.telegram_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/banner-stats?admin_id=${adminData.telegram_id}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [adminData]);

  // 📊 ФУНКЦИЯ СОЗДАНИЯ ГРАФИКА ПО ЧАСАМ
  const createHourlyChart = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) {
      return <div style={{ color: '#6c757d', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
        📊 Нет данных для графика
      </div>;
    }

    const maxClicks = Math.max(...hourlyData.map(d => d.clicks));
    const chartHeight = 60;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '4px',
        padding: '10px',
        background: 'rgba(0,123,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(0,123,255,0.1)',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#007bff', marginRight: '8px' }}>
          📊 По часам:
        </div>
        {hourlyData.map((item, index) => {
          const height = maxClicks > 0 ? (item.clicks / maxClicks) * chartHeight : 5;
          const isActive = item.clicks > 0;
          
          return (
            <div
              key={index}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              title={`${item.hour}:00 - ${item.clicks} кликов`}
            >
              {/* Столбец */}
              <div
                style={{
                  width: '20px',
                  height: `${Math.max(height, 5)}px`,
                  background: isActive 
                    ? `linear-gradient(to top, #007bff 0%, #0056b3 100%)` 
                    : '#e9ecef',
                  borderRadius: '3px 3px 0 0',
                  border: isActive ? '1px solid #0056b3' : '1px solid #dee2e6',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 2px 4px rgba(0,123,255,0.3)' : 'none'
                }}
              />
              
              {/* Подпись */}
              <div style={{
                fontSize: '9px',
                color: isActive ? '#007bff' : '#6c757d',
                fontWeight: isActive ? '600' : '400',
                marginTop: '2px',
                textAlign: 'center'
              }}>
                {item.hour}
              </div>
              
              {/* Значение кликов */}
              {item.clicks > 0 && (
                <div style={{
                  fontSize: '8px',
                  color: '#007bff',
                  fontWeight: '700',
                  background: 'white',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  border: '1px solid #007bff',
                  position: 'absolute',
                  top: `-${height + 15}px`,
                  whiteSpace: 'nowrap'
                }}>
                  {item.clicks}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 📈 ФУНКЦИЯ СОЗДАНИЯ ГРАФИКА ПО ДНЯМ
  const createDailyChart = (dailyData) => {
    if (!dailyData || dailyData.length === 0) {
      return <div style={{ color: '#6c757d', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
        📅 Нет данных за последние дни
      </div>;
    }

    const maxClicks = Math.max(...dailyData.map(d => d.clicks));
    
    return (
      <div style={{
        background: 'rgba(40,167,69,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(40,167,69,0.1)',
        padding: '10px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#28a745', marginBottom: '8px' }}>
          📅 По дням (последние 7):
        </div>
        {dailyData.map((item, index) => {
          const percentage = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
          const date = new Date(item.date).toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit' 
          });
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '4px',
              fontSize: '11px'
            }}>
              <div style={{ 
                minWidth: '35px', 
                color: '#28a745', 
                fontWeight: '600' 
              }}>
                {date}
              </div>
              
              <div style={{
                flex: 1,
                height: '16px',
                background: '#e9ecef',
                borderRadius: '8px',
                overflow: 'hidden',
                margin: '0 8px',
                position: 'relative'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #28a745, #20c997)',
                  borderRadius: '8px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              
              <div style={{ 
                minWidth: '25px', 
                textAlign: 'right',
                color: '#155724',
                fontWeight: '700'
              }}>
                {item.clicks}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Функция форматирования времени
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Нет данных';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    return date.toLocaleDateString('ru-RU') + ' ' + 
           date.toLocaleTimeString('ru-RU', { 
             hour: '2-digit', 
             minute: '2-digit' 
           });
  };

  // Сброс статистики
  const resetStats = async () => {
    if (!window.confirm('🗑️ Вы уверены что хотите сбросить всю статистику баннера?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/analytics/banner-reset', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminData.telegram_id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Статистика успешно сброшена');
        loadStats(); // Перезагружаем данные
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (err) {
      alert('❌ Ошибка сброса статистики');
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        borderRadius: '12px',
        padding: '16px',
        margin: '10px 0',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        🔄 Загрузка статистики...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
        border: '1px solid #feb2b2',
        borderRadius: '12px',
        padding: '16px',
        margin: '10px 0',
        textAlign: 'center',
        color: '#c53030'
      }}>
        ❌ {error}
        <br />
        <button onClick={loadStats} style={{
          marginTop: '8px',
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🔄 Повторить
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      padding: '16px',
      margin: '10px 0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h5 style={{
        margin: '0 0 12px 0',
        color: '#495057',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '16px',
        fontWeight: '600'
      }}>🎯 Статистика баннера (серверная) 
        <span style={{
          backgroundColor: stats?.totalClicks > 0 ? '#28a745' : '#6c757d',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          marginLeft: '8px'
        }}>
          LIVE
        </span>
      </h5>
      
      {/* ОСНОВНЫЕ МЕТРИКИ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        fontSize: '14px',
        fontFamily: 'Montserrat, Arial, sans-serif',
        marginBottom: '12px'
      }}>
        <div style={{
          background: 'rgba(40, 167, 69, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(40, 167, 69, 0.2)'
        }}>
          <div style={{ color: '#28a745', fontWeight: '600', marginBottom: '4px' }}>
            📈 Всего кликов
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#155724' 
          }}>
            {stats?.totalClicks || 0}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(23, 162, 184, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(23, 162, 184, 0.2)'
        }}>
          <div style={{ color: '#17a2b8', fontWeight: '600', marginBottom: '4px' }}>
            🕒 Последний клик
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#0c5460',
            fontWeight: '500'
          }}>
            {formatTime(stats?.lastClick?.timestamp)}
          </div>
        </div>
      </div>

      {/* ДОПОЛНИТЕЛЬНЫЕ МЕТРИКИ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        fontSize: '14px',
        fontFamily: 'Montserrat, Arial, sans-serif',
        marginBottom: '12px'
      }}>
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.2)'
        }}>
          <div style={{ color: '#856404', fontWeight: '600', marginBottom: '4px' }}>
            👥 Уникальные IP (24ч)
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#533f03' 
          }}>
            {stats?.uniqueIPs24h || 0}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(108, 117, 125, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(108, 117, 125, 0.2)'
        }}>
          <div style={{ color: '#495057', fontWeight: '600', marginBottom: '4px' }}>
            📅 За сегодня
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#212529' 
          }}>
            {stats?.hourlyStats?.reduce((sum, hour) => sum + hour.clicks, 0) || 0}
          </div>
        </div>
      </div>

      {/* 📊 ГРАФИК ПО ЧАСАМ */}
      {createHourlyChart(stats?.hourlyStats)}

      {/* 📅 ГРАФИК ПО ДНЯМ */}
      {createDailyChart(stats?.dailyStats)}
      
      {/* КНОПКИ УПРАВЛЕНИЯ */}
      <div style={{ 
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={resetStats}>
          🗑️ Сбросить
        </button>
        
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={() => {
          const exportData = `📊 Статистика баннера EasyWeather (серверная):
🎯 Всего кликов: ${stats?.totalClicks || 0}
👥 Уникальные IP (24ч): ${stats?.uniqueIPs24h || 0}
🕒 Последний клик: ${stats?.lastClick?.timestamp ? 
  new Date(stats.lastClick.timestamp).toLocaleString('ru-RU') : 'Нет данных'}
📅 За сегодня: ${stats?.hourlyStats?.reduce((sum, hour) => sum + hour.clicks, 0) || 0}
📱 Администратор: ${adminData?.first_name} (@${adminData?.username})
🗓️ Экспорт: ${new Date().toLocaleString('ru-RU')}

📊 По часам:
${stats?.hourlyStats?.map(h => `${h.hour}:00 - ${h.clicks} кликов`).join('\n') || 'Нет данных'}

📅 По дням:
${stats?.dailyStats?.map(d => `${d.date} - ${d.clicks} кликов`).join('\n') || 'Нет данных'}`;
          
          navigator.clipboard.writeText(exportData).then(() => {
            alert('📋 Статистика скопирована в буфер обмена');
          }).catch(() => {
            alert('📊 Статистика баннера:\n' + exportData);
          });
        }}>
          📋 Экспорт
        </button>
        
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={loadStats}>
          🔄 Обновить
        </button>

        <button style={{
          padding: '6px 12px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={() => {
          // Детальная статистика
          fetch(`http://localhost:3001/api/analytics/banner/detailed-stats?admin_id=${adminData.telegram_id}&period=1d`)
            .then(r => r.json())
            .then(data => {
              if (data.success) {
                console.log('🔍 Детальная статистика:', data);
                alert('🔍 Детальная статистика выведена в консоль (F12)');
              } else {
                alert('❌ Детальная статистика недоступна: ' + data.error);
              }
            })
            .catch(e => alert('❌ Endpoint детальной статистики не найден'));
        }}>
          🔍 Детали
        </button>
      </div>
    </div>
  );
};

// 🤖 Компонент дашборда телеграм аналитики
const TelegramAnalytics = ({ adminData }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем телеграм статистику с сервера
  const loadTelegramStats = async () => {
    if (!adminData?.telegram_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/telegram-stats?admin_id=${adminData.telegram_id}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Ошибка загрузки телеграм статистики:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadTelegramStats();
    
    // Автообновление каждые 60 секунд
    const interval = setInterval(loadTelegramStats, 60000);
    return () => clearInterval(interval);
  }, [adminData]);

  // Функция форматирования длительности
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0 сек';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) return `${remainingSeconds} сек`;
    if (minutes < 60) return `${minutes} мин ${remainingSeconds} сек`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}м`;
  };

  // 📊 Создание графика топ действий
  const createTopActionsChart = (topActions) => {
    if (!topActions || topActions.length === 0) {
      return <div style={{ color: '#6c757d', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
        🎬 Нет данных о действиях
      </div>;
    }

    const maxCount = Math.max(...topActions.map(a => a.count));

    return (
      <div style={{
        background: 'rgba(156,39,176,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(156,39,176,0.1)',
        padding: '10px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '8px' }}>
          🎬 Топ действий в Mini App:
        </div>
        {topActions.slice(0, 5).map((action, index) => {
          const percentage = maxCount > 0 ? (action.count / maxCount) * 100 : 0;
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '4px',
              fontSize: '11px'
            }}>
              <div style={{ 
                minWidth: '80px', 
                color: '#7b1fa2', 
                fontWeight: '600',
                fontSize: '10px'
              }}>
                {action.action_type}
              </div>
              
              <div style={{
                flex: 1,
                height: '14px',
                background: '#f3e5f5',
                borderRadius: '7px',
                overflow: 'hidden',
                margin: '0 8px',
                position: 'relative'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #7b1fa2, #9c27b0)',
                  borderRadius: '7px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              
              <div style={{ 
                minWidth: '20px', 
                textAlign: 'right',
                color: '#4a148c',
                fontWeight: '700',
                fontSize: '10px'
              }}>
                {action.count}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
        border: '1px solid #28a745',
        borderRadius: '12px',
        padding: '16px',
        margin: '10px 0',
        textAlign: 'center',
        color: '#155724'
      }}>
        🤖 Загрузка телеграм аналитики...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
        border: '1px solid #feb2b2',
        borderRadius: '12px',
        padding: '16px',
        margin: '10px 0',
        textAlign: 'center',
        color: '#c53030'
      }}>
        ❌ Ошибка телеграм аналитики: {error}
        <br />
        <button onClick={loadTelegramStats} style={{
          marginTop: '8px',
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🔄 Повторить
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
      border: '1px solid #28a745',
      borderRadius: '12px',
      padding: '16px',
      margin: '10px 0',
      boxShadow: '0 2px 8px rgba(40,167,69,0.1)'
    }}>
      <h5 style={{
        margin: '0 0 12px 0',
        color: '#155724',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '16px',
        fontWeight: '600'
      }}>🤖 Телеграм аналитика 
        <span style={{
          backgroundColor: stats?.totalUsers > 0 ? '#007bff' : '#6c757d',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          marginLeft: '8px'
        }}>
          BOT
        </span>
      </h5>
      
      {/* ОСНОВНЫЕ МЕТРИКИ ТЕЛЕГРАМ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        fontSize: '14px',
        fontFamily: 'Montserrat, Arial, sans-serif',
        marginBottom: '12px'
      }}>
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#388e3c', fontWeight: '600', marginBottom: '4px' }}>
            👥 Всего пользователей
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1b5e20' 
          }}>
            {stats?.totalUsers || 0}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(33, 150, 243, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#1976d2', fontWeight: '600', marginBottom: '4px' }}>
            🎯 Активных сегодня
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#0d47a1' 
          }}>
            {stats?.todayUsers || 0}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(156, 39, 176, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(156, 39, 176, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#7b1fa2', fontWeight: '600', marginBottom: '4px' }}>
            📱 Всего сессий
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#4a148c' 
          }}>
            {stats?.totalSessions || 0}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 152, 0, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 152, 0, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#f57c00', fontWeight: '600', marginBottom: '4px' }}>
            ⏱️ Среднее время
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '700', 
            color: '#e65100' 
          }}>
            {formatDuration(stats?.avgSessionDuration)}
          </div>
        </div>
      </div>

      {/* Активные сессии */}
      {stats?.activeSessions > 0 && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          marginBottom: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#2e7d32'
        }}>
          🟢 Сейчас онлайн: {stats.activeSessions} пользователей
        </div>
      )}

      {/* 🎬 График топ действий */}
      {createTopActionsChart(stats?.topActions)}
      
      {/* КНОПКИ УПРАВЛЕНИЯ ТЕЛЕГРАМ */}
      <div style={{ 
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={loadTelegramStats}>
          🔄 Обновить
        </button>
        
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={() => {
          const exportData = `🤖 Телеграм аналитика EasyWeather:
👥 Всего пользователей: ${stats?.totalUsers || 0}
🎯 Активных сегодня: ${stats?.todayUsers || 0}
📱 Всего сессий: ${stats?.totalSessions || 0}
🟢 Активных сессий: ${stats?.activeSessions || 0}
⏱️ Среднее время сессии: ${formatDuration(stats?.avgSessionDuration)}
📱 Администратор: ${adminData?.first_name} (@${adminData?.username})
🗓️ Экспорт: ${new Date().toLocaleString('ru-RU')}

🎬 Топ действий:
${stats?.topActions?.map(a => `${a.action_type}: ${a.count}`).join('\n') || 'Нет данных'}`;
          
          navigator.clipboard.writeText(exportData).then(() => {
            alert('📋 Телеграм статистика скопирована в буфер обмена');
          }).catch(() => {
            alert('🤖 Телеграм статистика:\n' + exportData);
          });
        }}>
          📋 Экспорт
        </button>
        
        <button style={{
          padding: '6px 12px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }} onClick={() => {
          console.log('🤖 Полная телеграм статистика:', stats);
          alert('🤖 Полная телеграм статистика выведена в консоль (F12)');
        }}>
          🔍 Детали
        </button>
      </div>
    </div>
  );
};

// Основной компонент AdminPanel
const AdminPanel = ({ isVisible, onClose }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAdminStatus = async () => {
    if (!telegramId) {
      alert('Введите Telegram ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: parseInt(telegramId)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsAdmin(result.isAdmin);
        setAdminData(result.adminData);
        
        if (!result.isAdmin) {
          alert('❌ У вас нет прав администратора');
        }
      } else {
        alert('Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка проверки админа:', error);
      alert('Ошибка подключения к серверу');
    }
    setLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2>🔐 Админская панель EasyWeather</h2>
        
        {!isAdmin ? (
          <div>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              color: '#6b7280',
              fontFamily: 'Montserrat, Arial, sans-serif',
              textAlign: 'center'
            }}>
              Введите ваш Telegram ID для доступа:
            </p>
            <input
              type="number"
              placeholder="Ваш Telegram ID"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              style={{
                padding: '14px 16px',
                margin: '0 0 16px 0',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                width: '100%',
                fontSize: '18px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: '500',
                boxSizing: 'border-box',
                outline: 'none',
                textAlign: 'center',
                height: '50px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />

            <button
              onClick={checkAdminStatus}
              disabled={loading || !telegramId}
              style={{
                padding: '14px 24px',
                backgroundColor: (loading || !telegramId) ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: (loading || !telegramId) ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: '600',
                fontSize: '18px',
                width: '100%',
                height: '50px',
                marginBottom: '16px',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </button>
            <p style={{ 
              fontSize: '15px', 
              color: '#9ca3af',
              fontFamily: 'Montserrat, Arial, sans-serif',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}>
             💡 Узнать свой ID: @userinfobot в Telegram
            </p>
          </div>
        ) : (
          <div>
            <h3>✅ Добро пожаловать, {adminData?.first_name}!</h3>
            <p>🆔 ID: {adminData?.telegram_id}</p>
            <p>👤 Username: @{adminData?.username}</p>
            
            <div style={{ margin: '20px 0' }}>
              <h4>🛠️ Функции администратора:</h4>
              
              {/* Серверная статистика баннера */}
              <BannerAnalytics adminData={adminData} />
              
              {/* 🆕 ТЕЛЕГРАМ АНАЛИТИКА */}
              <TelegramAnalytics adminData={adminData} />
              
              <button style={{
                padding: '10px 15px',
                margin: '5px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }} onClick={() => alert('📊 Статистика запросов пока в разработке')}>
                📊 Статистика запросов
              </button>
              <br />
              <button style={{
                padding: '10px 15px',
                margin: '5px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }} onClick={() => alert('👥 Управление админами пока в разработке')}>
                👥 Управление админами
              </button>
              <br />
              <button style={{
                padding: '10px 15px',
                margin: '5px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Montserrat, Arial, sans-serif'
              }} onClick={() => window.open('http://localhost:3001/health/database', '_blank')}>
                🗄️ Проверить базу данных
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={onClose}
          style={{
            padding: '14px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '18px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: '600',
            width: '100%',
            height: '50px',
            marginTop: '16px',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;