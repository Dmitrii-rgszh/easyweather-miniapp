@echo off
chcp 65001 >nul
echo 🎯 ТОЛЬКО база данных - решаем главную проблему
echo.

echo Останавливаем все что может мешать...
docker stop easyweather-postgres 2>nul
docker rm easyweather-postgres 2>nul

echo.
echo 🐘 Запускаем PostgreSQL с правильным пользователем:

docker run -d ^
  --name easyweather-postgres ^
  -e POSTGRES_DB=easyweather ^
  -e POSTGRES_USER=easyweather_user ^
  -e POSTGRES_PASSWORD=EasyWeather2025SecurePass! ^
  -p 5432:5432 ^
  postgres:15-alpine

echo.
echo ⏳ Ждем 10 секунд пока БД запустится...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Проверяем что пользователь создался:
docker exec easyweather-postgres psql -U easyweather_user -d easyweather -c "SELECT current_user, current_database();"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ УСПЕХ! Пользователь easyweather_user существует!
    echo.
    echo 📋 Данные для подключения:
    echo   Host: localhost 
    echo   Port: 5432
    echo   Database: easyweather
    echo   User: easyweather_user  
    echo   Password: EasyWeather2025SecurePass!
    echo.
    echo 🔗 Строка подключения:
    echo postgresql://easyweather_user:EasyWeather2025SecurePass!@localhost:5432/easyweather
    echo.
    echo 🎯 Теперь попробуйте запустить ваше приложение!
) else (
    echo ❌ Что-то пошло не так. Проверьте Docker Desktop.
)

echo.
pause