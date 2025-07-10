@echo off
chcp 65001 >nul
title EasyWeather - Startup Script

echo.
echo ====================================
echo    🌤️  EasyWeather Startup Script
echo ====================================
echo.

:: Проверяем наличие Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден! Установите Node.js с https://nodejs.org
    pause
    exit /b 1
)

:: Проверяем наличие Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден! Установите Python с https://python.org
    pause
    exit /b 1
)

:: Проверяем наличие Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker не найден! Установите Docker Desktop
    echo    📥 https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Все зависимости найдены!
echo.

:: Создаем папку для логов
if not exist "logs" mkdir logs

:start_menu
cls
echo.
echo ====================================
echo    🌤️  EasyWeather Startup Script
echo ====================================
echo.
echo 📋 Выберите режим запуска:
echo.
echo [1] Полный запуск (БД + Сервер + Фронт + Бот)
echo [2] Разработка (БД + Сервер + Фронт)
echo [3] Только БД + Сервер
echo [4] Только Фронт
echo [5] Остановить все сервисы
echo [6] Выход
echo.

:: 🔧 ИСПРАВЛЕНИЕ: Используем choice вместо set /p
choice /c 123456 /n /m "Выберите пункт (1-6): "
set choice=%errorlevel%

if %choice%==1 goto full_start
if %choice%==2 goto dev_start
if %choice%==3 goto backend_only
if %choice%==4 goto frontend_only
if %choice%==5 goto stop_services
if %choice%==6 goto exit_script

:: На случай если что-то пошло не так
goto start_menu

:full_start
echo.
echo 🚀 Запускаем полный стек...
echo.

:: 1. Запускаем БД (PostgreSQL в Docker)
echo 📊 Запуск базы данных...
start "PostgreSQL Database" cmd /k "docker-compose up postgres"
timeout /t 3 /nobreak >nul

:: 2. Запускаем Backend сервер
echo 🔧 Запуск backend сервера...
start "Backend Server" cmd /k "cd backend && python app.py"
timeout /t 2 /nobreak >nul

:: 3. Запускаем Frontend
echo 🌐 Запуск frontend...
start "Frontend React" cmd /k "cd frontend && npm start"
timeout /t 2 /nobreak >nul

:: 4. Запускаем Telegram бота
echo 🤖 Запуск Telegram бота...
start "Telegram Bot" cmd /k "cd bot && python bot.py"

echo.
echo ✅ Все сервисы запущены!
echo.
echo 🌍 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 📊 БД:       localhost:5432
echo 🤖 Telegram Bot активен
echo.
goto wait_exit

:dev_start
echo.
echo 💻 Запускаем режим разработки...
echo.

:: 1. Запускаем БД
echo 📊 Запуск базы данных...
start "PostgreSQL Database" cmd /k "docker-compose up postgres"
timeout /t 3 /nobreak >nul

:: 2. Запускаем Backend
echo 🔧 Запуск backend сервера...
start "Backend Server" cmd /k "cd backend && python app.py"
timeout /t 2 /nobreak >nul

:: 3. Запускаем Frontend
echo 🌐 Запуск frontend...
start "Frontend React" cmd /k "cd frontend && npm start"

echo.
echo ✅ Режим разработки запущен!
echo.
echo 🌍 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 📊 БД:       localhost:5432
echo.
goto wait_exit

:backend_only
echo.
echo 🔧 Запускаем только Backend...
echo.

:: 1. Запускаем БД
echo 📊 Запуск базы данных...
start "PostgreSQL Database" cmd /k "docker-compose up postgres"
timeout /t 3 /nobreak >nul

:: 2. Запускаем Backend
echo 🔧 Запуск backend сервера...
start "Backend Server" cmd /k "cd backend && python app.py"

echo.
echo ✅ Backend запущен!
echo.
echo 🔧 Backend: http://localhost:3001
echo 📊 БД:      localhost:5432
echo.
goto wait_exit

:frontend_only
echo.
echo 🌐 Запускаем только Frontend...
echo.

:: Проверяем установлены ли зависимости
if not exist "frontend\node_modules" (
    echo 📦 Устанавливаем зависимости...
    cd frontend
    npm install
    cd ..
)

start "Frontend React" cmd /k "cd frontend && npm start"

echo.
echo ✅ Frontend запущен!
echo.
echo 🌍 Frontend: http://localhost:3000
echo.
goto wait_exit

:stop_services
echo.
echo 🛑 Останавливаем все сервисы...
echo.

:: Останавливаем Docker контейнеры
docker-compose down >nul 2>&1

:: Убиваем процессы Node.js и Python
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

echo ✅ Все сервисы остановлены!
echo.
pause
goto start_menu

:wait_exit
echo.
echo 💡 Советы:
echo    • Подождите 30-60 секунд для полной загрузки всех сервисов
echo    • Frontend откроется автоматически в браузере
echo    • Все логи отображаются в отдельных окнах
echo    • Для остановки используйте Ctrl+C в каждом окне
echo.
echo 🔧 Для остановки всех сервисов используйте пункт 5 в меню
echo.

:: 🔧 ИСПРАВЛЕНИЕ: Добавляем возможность вернуться в меню
echo.
choice /c MX /n /m "Нажмите [M] для возврата в меню или [X] для выхода: "
if %errorlevel%==1 goto start_menu
if %errorlevel%==2 goto exit_script

:exit_script
echo.
echo 👋 До свидания!
echo.
pause
exit /b 0