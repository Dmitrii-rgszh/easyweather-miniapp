import React, { useState } from 'react';

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
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        padding: '20px',
    boxSizing: 'border-box'
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

            <br />
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
                ontSize: '10px',
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
              <button style={{
                padding: '10px 15px',
                margin: '5px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }} onClick={() => alert('📊 Статистика пока в разработке')}>
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
                cursor: 'pointer'
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
                cursor: 'pointer'
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