# Используем официальный node-образ
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Эти строки пробрасывают переменные окружения
ARG REACT_APP_WEATHER_API_KEY
ARG REACT_APP_UNSPLASH_KEY
ARG REACT_APP_GEO_API_KEY
ENV REACT_APP_WEATHER_API_KEY=$REACT_APP_WEATHER_API_KEY
ENV REACT_APP_UNSPLASH_KEY=$REACT_APP_UNSPLASH_KEY
ENV REACT_APP_GEO_API_KEY=$REACT_APP_GEO_API_KEY

RUN npm run build

# Второй этап — Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
