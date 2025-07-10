FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS production
RUN npm ci --only=production && npm cache clean --force

# Создаем папки для данных
RUN mkdir -p /app/data && chmod 755 /app/data
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Создаем пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Копируем код
COPY --chown=nodejs:nodejs . .

# Настраиваем права
RUN chown -R nodejs:nodejs /app/data /app/logs && \
    chmod 755 /app/data && \
    touch /app/data/database.db && \
    chmod 664 /app/data/database.db && \
    chown nodejs:nodejs /app/data/database.db

# Создаем start.sh ДО переключения на nodejs
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'touch /app/data/database.db 2>/dev/null || true' >> /app/start.sh && \
    echo 'chmod 664 /app/data/database.db 2>/dev/null || true' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nodejs:nodejs /app/start.sh

# Переключаемся на nodejs
USER nodejs

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["/app/start.sh"]