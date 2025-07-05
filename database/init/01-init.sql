-- EasyWeather Database Initialization Script
-- Создание безопасной схемы базы данных

-- Подключаемся к базе easyweather
\c easyweather;

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание схем для организации таблиц
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS weather;
CREATE SCHEMA IF NOT EXISTS logs;

-- === ТАБЛИЦЫ АУТЕНТИФИКАЦИИ ===

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS auth.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_admins_username ON auth.admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON auth.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_active ON auth.admins(is_active) WHERE is_active = true;

-- Таблица сессий администраторов  
CREATE TABLE IF NOT EXISTS auth.admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.admins(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для сессий
CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON auth.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON auth.admin_sessions(expires_at);

-- === ТАБЛИЦЫ ПОГОДНЫХ ДАННЫХ ===

-- Таблица городов
CREATE TABLE IF NOT EXISTS weather.cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(2) NOT NULL,
    state VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для городов
CREATE INDEX IF NOT EXISTS idx_cities_name ON weather.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_country ON weather.cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_coordinates ON weather.cities(latitude, longitude);

-- Таблица запросов погоды (для аналитики)
CREATE TABLE IF NOT EXISTS weather.weather_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id INTEGER REFERENCES weather.cities(id),
    city_name VARCHAR(100) NOT NULL,
    user_ip INET,
    user_agent TEXT,
    telegram_user_id BIGINT,
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    api_source VARCHAR(50), -- openweathermap, etc.
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_weather_requests_city ON weather.weather_requests(city_id);
CREATE INDEX IF NOT EXISTS idx_weather_requests_timestamp ON weather.weather_requests(request_timestamp);
CREATE INDEX IF NOT EXISTS idx_weather_requests_telegram_user ON weather.weather_requests(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_weather_requests_success ON weather.weather_requests(success);

-- Таблица кэшированных данных погоды
CREATE TABLE IF NOT EXISTS weather.weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name VARCHAR(100) NOT NULL,
    weather_data JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Индексы для кэша
CREATE INDEX IF NOT EXISTS idx_weather_cache_city ON weather.weather_cache(city_name);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather.weather_cache(expires_at);

-- === ТАБЛИЦЫ ЛОГИРОВАНИЯ ===

-- Таблица логов системы
CREATE TABLE IF NOT EXISTS logs.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL, -- DEBUG, INFO, WARN, ERROR
    message TEXT NOT NULL,
    service VARCHAR(50), -- frontend, backend, bot
    context JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для логов
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON logs.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON logs.system_logs(service);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON logs.system_logs(timestamp);

-- Таблица логов доступа
CREATE TABLE IF NOT EXISTS logs.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для логов доступа
CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON logs.access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON logs.access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON logs.access_logs(status_code);

-- === ФУНКЦИИ И ТРИГГЕРЫ ===

-- Функция обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для таблицы администраторов
CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON auth.admins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Функция очистки старых сессий
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth.admin_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO logs.system_logs (level, message, service, context)
    VALUES ('INFO', 'Cleaned up expired sessions', 'database', 
            jsonb_build_object('deleted_count', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Функция очистки старого кэша
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM weather.weather_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO logs.system_logs (level, message, service, context)
    VALUES ('INFO', 'Cleaned up expired cache', 'database', 
            jsonb_build_object('deleted_count', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- === РОЛИ И ПРАВА ДОСТУПА ===

-- Создание ролей для разных типов доступа
DO $$
BEGIN
    -- Роль только для чтения
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'easyweather_readonly') THEN
        CREATE ROLE easyweather_readonly;
    END IF;
    
    -- Роль для приложения
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'easyweather_app') THEN
        CREATE ROLE easyweather_app;
    END IF;
    
    -- Роль для аналитики
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'easyweather_analytics') THEN
        CREATE ROLE easyweather_analytics;
    END IF;
END
$$;

-- Назначение прав ролям
-- Роль только для чтения
GRANT USAGE ON SCHEMA weather, logs TO easyweather_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA weather, logs TO easyweather_readonly;

-- Роль приложения
GRANT USAGE ON SCHEMA auth, weather, logs TO easyweather_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, weather, logs TO easyweather_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, weather, logs TO easyweather_app;

-- Роль аналитики
GRANT USAGE ON SCHEMA weather, logs TO easyweather_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA weather, logs TO easyweather_analytics;

-- Назначение ролей основному пользователю
GRANT easyweather_app TO easyweather_user;

-- === СОЗДАНИЕ АДМИНИСТРАТОРА ПО УМОЛЧАНИЮ ===

-- Создание администратора по умолчанию (пароль: Admin2025!)
DO $$
DECLARE
    salt_value TEXT;
    password_hash TEXT;
BEGIN
    -- Генерация соли
    salt_value := encode(gen_random_bytes(32), 'hex');
    
    -- Хэширование пароля с солью
    password_hash := encode(digest(salt_value || 'Admin2025!', 'sha256'), 'hex');
    
    -- Вставка администратора если его нет
    INSERT INTO auth.admins (username, email, password_hash, salt)
    VALUES ('admin', 'admin@easyweather.local', password_hash, salt_value)
    ON CONFLICT (username) DO NOTHING;
    
    -- Логирование
    INSERT INTO logs.system_logs (level, message, service)
    VALUES ('INFO', 'Default admin created', 'database');
END
$$;

-- === ПРЕДСТАВЛЕНИЯ ДЛЯ УДОБСТВА ===

-- Представление активных сессий
CREATE OR REPLACE VIEW auth.active_sessions AS
SELECT 
    s.id,
    s.admin_id,
    a.username,
    a.email,
    s.ip_address,
    s.created_at,
    s.expires_at
FROM auth.admin_sessions s
JOIN auth.admins a ON s.admin_id = a.id
WHERE s.is_active = true 
  AND s.expires_at > NOW();

-- Представление статистики по городам
CREATE OR REPLACE VIEW weather.city_stats AS
SELECT 
    c.id,
    c.name,
    c.country,
    COUNT(wr.id) as request_count,
    MAX(wr.request_timestamp) as last_request,
    AVG(wr.response_time_ms) as avg_response_time
FROM weather.cities c
LEFT JOIN weather.weather_requests wr ON c.id = wr.city_id
GROUP BY c.id, c.name, c.country;

-- === БЕЗОПАСНОСТЬ ===

-- Включение Row Level Security (RLS)
ALTER TABLE auth.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для администраторов
CREATE POLICY admin_self_access ON auth.admins
    FOR ALL
    TO easyweather_user
    USING (id = current_setting('app.current_admin_id', true)::uuid);

-- Политики для сессий
CREATE POLICY session_admin_access ON auth.admin_sessions
    FOR ALL
    TO easyweather_user
    USING (admin_id = current_setting('app.current_admin_id', true)::uuid);

-- Финальное логирование
INSERT INTO logs.system_logs (level, message, service, context)
VALUES ('INFO', 'Database initialization completed', 'database', 
        jsonb_build_object('timestamp', NOW(), 'schemas_created', 4, 'tables_created', 8));

-- Отображение созданных объектов
\dt auth.*
\dt weather.*
\dt logs.*

-- Сообщение об успешной инициализации
SELECT 'EasyWeather Database successfully initialized!' as status;