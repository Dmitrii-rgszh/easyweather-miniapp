@echo off
chcp 65001 >nul
echo 🔧 Исправление Git и отправка изменений

echo.
echo 📁 Текущая директория:
cd
echo.

echo 📋 Добавляем все файлы в Git:
git add .

echo.
echo 📋 Показываем статус:
git status

echo.
echo 📋 Коммитим изменения:
git commit -m "Добавлен полный бэкенд API и исправлена работа с PostgreSQL"

echo.
echo 📋 Отправляем на GitHub:
git push origin main

echo.
echo ✅ Готово! Изменения отправлены на GitHub.
echo.

echo 📊 Проверяем что отправилось:
git log --oneline -5

echo.
pause