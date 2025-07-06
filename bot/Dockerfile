# Telegram Bot Dockerfile

FROM python:3.11-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache gcc musl-dev

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir -r requirements.txt

# Создаем пользователя для безопасности
RUN adduser -D -s /bin/sh botuser

# Копируем код бота
COPY --chown=botuser:botuser . .

# Переключаемся на непривилегированного пользователя
USER botuser

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import requests; requests.get('${API_URL}/health', timeout=5)" || exit 1

# Запускаем бота
CMD ["python", "bot.py"]