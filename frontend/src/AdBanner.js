export default function AdBanner({ isPremium = false }) {
  // Скрываем рекламу для Premium пользователей
  if (isPremium) {
    return null;
  }
  
  return (
    <div style={{
      position: "fixed", 
      bottom: 0, 
      left: 0, 
      right: 0,
      background: "#fff", 
      padding: "12px 16px 12px 16px", // Увеличили боковые отступы
      zIndex: 100,
      boxShadow: "0 -2px 16px rgba(0,0,0,0.1)"
    }}>
      {/* Красивый баннер ВТБ */}
      <a 
        href="https://vtb.ru/l/m6e34kae" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
          borderRadius: 12,
          padding: '14px 16px',
          color: 'white',
          fontFamily: 'Montserrat, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s',
          width: '100%',
          maxWidth: '400px', // Максимальная ширина
          margin: '0 auto', // Центрируем
          boxSizing: 'border-box'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Градиентный акцент */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>
        
        {/* Левая часть - Логотип и текст */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          position: 'relative',
          zIndex: 1,
          marginRight: '16px' // Отступ от кнопки
        }}>
          <div style={{
            background: 'white',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            fontWeight: 800,
            color: '#0066CC',
            fontSize: 12,
            flexShrink: 0
          }}>
            ВТБ
          </div>
          <div style={{ 
            flex: 1,
            minWidth: 0
          }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 3
            }}>
              🎁 1000₽ на карту + кешбэк 15%
            </div>
            <div style={{ 
              fontSize: 11, 
              opacity: 0.9,
              lineHeight: 1.2
            }}>
              Бесплатная дебетовая карта ВТБ
            </div>
          </div>
        </div>

        {/* Правая часть - CTA кнопка */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.3)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          whiteSpace: 'nowrap'
        }}>
          Получить
        </div>
      </a>
    </div>
  );
}
