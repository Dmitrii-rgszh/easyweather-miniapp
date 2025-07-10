# Используем официальный node-образ
FROM node:20-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Получаем переменные окружения для сборки
ARG REACT_APP_WEATHER_API_KEY
ARG REACT_APP_UNSPLASH_KEY
ARG REACT_APP_GEO_API_KEY
ARG REACT_APP_API_URL

# Устанавливаем переменные окружения
ENV REACT_APP_WEATHER_API_KEY=$REACT_APP_WEATHER_API_KEY
ENV REACT_APP_UNSPLASH_KEY=$REACT_APP_UNSPLASH_KEY
ENV REACT_APP_GEO_API_KEY=$REACT_APP_GEO_API_KEY
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Собираем приложение
RUN npm run build

# Второй этап — Nginx для production
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html

# Копируем базовый конфиг nginx (создадим позже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nginxuser && \
    adduser -S nginxuser -u 1001

# Меняем владельца файлов
RUN chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d

# Создаем папки для работы nginx
RUN touch /var/run/nginx.pid && \
    chown nginxuser:nginxuser /var/run/nginx.pid

# Переключаемся на непривилегированного пользователя
USER nginxuser

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
