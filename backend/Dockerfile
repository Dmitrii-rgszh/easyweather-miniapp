# EasyWeather Backend Dockerfile

# Используем официальный Node.js образ
FROM node:20-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Стадия разработки
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Стадия продакшена
FROM base AS production

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем исходный код
COPY --chown=nodejs:nodejs . .

# Создаем директории для логов
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Переключаемся на непривилегированного пользователя
USER nodejs

# Открываем порт
EXPOSE 3001

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["npm", "start"]