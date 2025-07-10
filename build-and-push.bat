@echo off
REM 🚀 Скрипт для сборки и пуша образов в Docker Hub (Windows)

if "%1"=="" (
    echo ❌ Ошибка: Укажите ваш Docker Hub username
    echo 📝 Использование: build-and-push.bat your_dockerhub_username
    exit /b 1
)

set DOCKER_USERNAME=%1
set IMAGE_TAG=%2
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest

echo 🏗️ Начинаем сборку образов для пользователя: %DOCKER_USERNAME%
echo 🏷️ Тег образов: %IMAGE_TAG%

REM Логинимся в Docker Hub
echo 🔐 Логинимся в Docker Hub...
docker login

REM Собираем Backend
echo 🔨 Собираем Backend образ...
docker build -t %DOCKER_USERNAME%/easyweather-backend:%IMAGE_TAG% ./backend
echo ✅ Backend собран

REM Собираем Frontend
echo 🔨 Собираем Frontend образ...
docker build --build-arg REACT_APP_WEATHER_API_KEY=%REACT_APP_WEATHER_API_KEY% --build-arg REACT_APP_UNSPLASH_KEY=%REACT_APP_UNSPLASH_KEY% --build-arg REACT_APP_GEO_API_KEY=%REACT_APP_GEO_API_KEY% --build-arg REACT_APP_API_URL=https://easyweather.ru/api -t %DOCKER_USERNAME%/easyweather-frontend:%IMAGE_TAG% ./frontend
echo ✅ Frontend собран

REM Собираем Bot
echo 🔨 Собираем Bot образ...
docker build -t %DOCKER_USERNAME%/easyweather-bot:%IMAGE_TAG% ./bot
echo ✅ Bot собран

REM Пушим все образы
echo 📤 Пушим Backend в Docker Hub...
docker push %DOCKER_USERNAME%/easyweather-backend:%IMAGE_TAG%

echo 📤 Пушим Frontend в Docker Hub...
docker push %DOCKER_USERNAME%/easyweather-frontend:%IMAGE_TAG%

echo 📤 Пушим Bot в Docker Hub...
docker push %DOCKER_USERNAME%/easyweather-bot:%IMAGE_TAG%

echo.
echo 🎉 ВСЕ ОБРАЗЫ УСПЕШНО ЗАГРУЖЕНЫ В DOCKER HUB!
echo.
echo 📋 Загруженные образы:
echo    • %DOCKER_USERNAME%/easyweather-backend:%IMAGE_TAG%
echo    • %DOCKER_USERNAME%/easyweather-frontend:%IMAGE_TAG%
echo    • %DOCKER_USERNAME%/easyweather-bot:%IMAGE_TAG%
echo.
echo 🚀 Теперь можно деплоить на сервер!
pause