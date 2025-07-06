@echo off
chcp 65001 >nul
echo 🚀 EasyWeather Quick Start
echo.

REM Простая проверка Docker
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker не найден! Установите Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker найден

REM Создаем только критически важные папки
if not exist "database\init" mkdir "database\init"
if not exist "backend\src" mkdir "backend\src"

REM Создаем минимальный .env если его нет
if not exist ".env" (
    echo 🔑 Создание .env файла...
    (
        echo POSTGRES_PASSWORD=EasyWeather2025SecurePass!
        echo POSTGRES_PORT=5432
        echo PGADMIN_EMAIL=admin@easyweather.local
        echo PGADMIN_PASSWORD=AdminPass2025!
        echo PGADMIN_PORT=8080
        echo NODE_ENV=development
        echo JWT_SECRET=YourSuperSecretJWTKey2025!ChangeThis
        echo BACKEND_PORT=3001
        echo FRONTEND_PORT=3000
        echo CORS_ORIGIN=http://localhost:3000
        echo REACT_APP_WEATHER_API_KEY=your_openweather_api_key_here
        echo REACT_APP_UNSPLASH_KEY=your_unsplash_api_key_here
        echo REACT_APP_GEO_API_KEY=your_geo_api_key_here
        echo TELEGRAM_TOKEN=your_telegram_bot_token_here
        echo REACT_APP_API_URL=http://localhost:3001
    ) > .env
    echo ✅ .env создан
)

REM Проверяем наличие основных файлов
set FILES_OK=1

if not exist "docker-compose.yml" (
    echo ❌ Отсутствует docker-compose.yml
    set FILES_OK=0
)

if not exist "backend\package.json" (
    echo ❌ Отсутствует backend\package.json
    set FILES_OK=0
)

if not exist "database\init\01-init.sql" (
    echo ❌ Отсутствует database\init\01-init.sql
    set FILES_OK=0
)

if %FILES_OK%==0 (
    echo.
    echo 📋 НЕОБХОДИМЫЕ ДЕЙСТВИЯ:
    echo 1. Скопируйте docker-compose.yml из артефакта Claude
    echo 2. Создайте папку backend и скопируйте файлы бэкенда
    echo 3. Скопируйте database\init\01-init.sql
    echo 4. Запустите этот скрипт снова
    echo.
    pause
    exit /b 1
)

echo ✅ Основные файлы найдены

REM Установка зависимостей бэкенда
if exist "backend\package.json" (
    echo 📦 Установка зависимостей бэкенда...
    cd backend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Ошибка установки зависимостей
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Зависимости установлены
)

echo.
echo 🚀 Запуск сервисов...
docker-compose up -d

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Сервисы запущены!
    echo.
    echo 🌐 Доступные сервисы:
    echo - Frontend: http://localhost:3000
    echo - Backend API: http://localhost:3001
    echo - PgAdmin: http://localhost:8080
    echo - Health Check: http://localhost:3001/health
    echo.
    echo 📊 Проверка статуса через 30 секунд...
    timeout /t 30 /nobreak >nul
    
    echo.
    echo 🔍 Статус контейнеров:
    docker ps --filter "name=easyweather"
    
    echo.
    echo 🏥 Проверка здоровья API:
    curl -s http://localhost:3001/health || echo "API еще запускается..."
    
) else (
    echo ❌ Ошибка запуска сервисов
    echo Проверьте логи: docker-compose logs
)

echo.
pause