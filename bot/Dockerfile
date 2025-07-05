# Используем официальный минимальный Python-образ
FROM python:3.10-slim

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем файл зависимостей и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем сам файл бота
COPY bot.py .

# (Если есть дополнительные файлы, например config.py — добавь строку COPY config.py .)

# Запуск бота при старте контейнера
CMD ["python", "bot.py"]