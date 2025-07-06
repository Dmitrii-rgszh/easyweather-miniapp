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
      backgroundColor: 'rgba(0,0,0,0.8)',
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
        textAlign: 'center'
      }}>
        <h2>🔐 Админская панель EasyWeather</h2>
        
        {!isAdmin ? (
          <div>
            <p>Введите ваш Telegram ID для доступа:</p>
            <input
              type="number"
              placeholder="Ваш Telegram ID"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              style={{
                padding: '10px',
                margin: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '200px',
                fontSize: '16px'
              }}
            />
            <br />
            <button
              onClick={checkAdminStatus}
              disabled={loading || !telegramId}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                margin: '10px',
                fontSize: '16px'
              }}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </button>
            <p style={{ fontSize: '12px', color: '#666' }}>
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
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;