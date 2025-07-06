#!/bin/bash

# EasyWeather - Скрипт настройки безопасности
# Этот скрипт настраивает безопасную среду для EasyWeather

set -e  # Остановка при ошибке

echo "🔐 Настройка безопасности EasyWeather..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Проверка наличия Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен! Установите Docker и попробуйте снова."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен! Установите Docker Compose и попробуйте снова."
    fi
    
    success "Docker и Docker Compose найдены"
}

# Создание директорий
create_directories() {
    log "Создание структуры директорий..."
    
    mkdir -p database/init
    mkdir -p database/config
    mkdir -p database/backups
    mkdir -p database/pgadmin
    mkdir -p backend/src
    mkdir -p logs
    
    success "Директории созданы"
}

# Генерация паролей
generate_passwords() {
    log "Генерация безопасных паролей..."
    
    # Генерация случайных паролей
    POSTGRES_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    PGADMIN_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Создание .env файла
    cat > .env << EOF
# Автоматически сгенерированные пароли - НЕ ДЕЛИТЕСЬ ЭТИМ ФАЙЛОМ!
POSTGRES_PASSWORD=${POSTGRES_PASS}
JWT_SECRET=${JWT_SECRET}
PGADMIN_PASSWORD=${PGADMIN_PASS}

# Настройки портов
POSTGRES_PORT=5432
PGADMIN_PORT=8080
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Настройки приложения
NODE_ENV=production
PGADMIN_EMAIL=admin@easyweather.local
CORS_ORIGIN=http://localhost:3000

# API ключи - ЗАПОЛНИТЕ СВОИМИ ЗНАЧЕНИЯМИ!
REACT_APP_WEATHER_API_KEY=61e36d8b6d0a171b685c5658b023c23a
REACT_APP_UNSPLASH_KEY=9ho2EDWMLi9bQOlhqJY0s_NaZNRt_EbVqij0SUhFD7U
REACT_APP_GEO_API_KEY=your_geo_api_key_here
TELEGRAM_TOKEN=8055577633:AAGS26-wGLlMYjGlN5jotzkerULWnwWagoc
REACT_APP_API_URL=http://localhost:3001
EOF

    success "Пароли сгенерированы и сохранены в .env"
    warning "ВАЖНО: Заполните API ключи в файле .env!"
}

# Создание конфигурации PostgreSQL
create_postgres_config() {
    log "Создание конфигурации PostgreSQL..."
    
    # postgresql.conf
    cat > database/config/postgresql.conf << 'EOF'
# EasyWeather PostgreSQL Configuration

# Подключения и аутентификация
listen_addresses = '*'
port = 5432
max_connections = 20
password_encryption = scram-sha-256

# Память
shared_buffers = 128MB
effective_cache_size = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB

# Логирование
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 10MB
log_min_messages = warning
log_min_error_statement = error
log_statement = 'mod'  # Логирование изменений
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Безопасность
ssl = off  # Включите в продакшене
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on

# Производительность
checkpoint_timeout = 5min
checkpoint_completion_target = 0.7
wal_buffers = 16MB
default_statistics_target = 100

# Автовакуум
autovacuum = on
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
EOF

    # pg_hba.conf
    cat > database/config/pg_hba.conf << 'EOF'
# EasyWeather PostgreSQL Host-Based Authentication Configuration

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Локальные подключения
local   all             all                                     scram-sha-256

# IPv4 подключения
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             172.20.0.0/16           scram-sha-256
host    easyweather     easyweather_user 172.20.0.0/16         scram-sha-256

# Запрет всех остальных подключений
host    all             all             0.0.0.0/0               reject
EOF

    success "Конфигурация PostgreSQL создана"
}

# Создание скрипта резервного копирования
create_backup_script() {
    log "Создание скрипта резервного копирования..."
    
    cat > database/backup.sh << 'EOF'
#!/bin/bash

# Скрипт резервного копирования EasyWeather DB

set -e

# Загрузка переменных окружения
source .env

# Настройки
BACKUP_DIR="database/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="easyweather_backup_${DATE}.sql"

echo "Создание резервной копии базы данных..."

# Создание резервной копии
docker exec easyweather-postgres pg_dump \
    -U easyweather_user \
    -d easyweather \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain > "${BACKUP_DIR}/${BACKUP_FILE}"

# Сжатие
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "Резервная копия создана: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Удаление старых копий (старше 30 дней)
find "${BACKUP_DIR}" -name "*.gz" -mtime +30 -delete

echo "Резервное копирование завершено!"
EOF

    chmod +x database/backup.sh
    success "Скрипт резервного копирования создан"
}

# Создание PgAdmin серверов
create_pgadmin_config() {
    log "Создание конфигурации PgAdmin..."
    
    cat > database/pgadmin/servers.json << 'EOF'
{
    "Servers": {
        "1": {
            "Name": "EasyWeather Database",
            "Group": "EasyWeather",
            "Host": "easyweather-postgres",
            "Port": 5432,
            "MaintenanceDB": "easyweather",
            "Username": "easyweather_user",
            "SSLMode": "prefer",
            "SSLCert": "<STORAGE_DIR>/.postgresql/postgresql.crt",
            "SSLKey": "<STORAGE_DIR>/.postgresql/postgresql.key",
            "SSLCompression": 0,
            "Timeout": 10,
            "UseSSHTunnel": 0,
            "TunnelPort": "22",
            "TunnelAuthentication": 0
        }
    }
}
EOF

    success "Конфигурация PgAdmin создана"
}

# Создание мониторинга
create_monitoring() {
    log "Создание скрипта мониторинга..."
    
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Скрипт мониторинга EasyWeather

echo "=== EasyWeather System Status ==="
echo

# Статус контейнеров
echo "📦 Контейнеры:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=easyweather"
echo

# Использование ресурсов
echo "💾 Использование ресурсов:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" --filter "name=easyweather"
echo

# Логи ошибок (последние 10 строк)
echo "📋 Последние ошибки PostgreSQL:"
docker logs easyweather-postgres 2>&1 | grep -i error | tail -5 || echo "Ошибок не найдено"
echo

# Подключение к базе данных
echo "🔗 Тест подключения к БД:"
if docker exec easyweather-postgres pg_isready -U easyweather_user -d easyweather > /dev/null 2>&1; then
    echo "✅ База данных доступна"
else
    echo "❌ База данных недоступна"
fi
echo

# Размер базы данных
echo "💿 Размер базы данных:"
docker exec easyweather-postgres psql -U easyweather_user -d easyweather -c "
    SELECT 
        pg_size_pretty(pg_database_size('easyweather')) as database_size,
        (SELECT count(*) FROM auth.admins) as admin_count,
        (SELECT count(*) FROM weather.weather_requests) as weather_requests_count;
" 2>/dev/null || echo "Не удалось получить информацию о БД"

echo "=== Конец отчета ==="
EOF

    chmod +x monitor.sh
    success "Скрипт мониторинга создан"
}

# Настройка файрвола (опционально)
setup_firewall() {
    if command -v ufw &> /dev/null; then
        log "Настройка UFW файрвола..."
        
        # Разрешить SSH
        sudo ufw allow ssh
        
        # Разрешить HTTP/HTTPS
        sudo ufw allow 80
        sudo ufw allow 443
        
        # Разрешить порты приложения только локально
        sudo ufw allow from 127.0.0.1 to any port 3000
        sudo ufw allow from 127.0.0.1 to any port 3001
        sudo ufw allow from 127.0.0.1 to any port 5432
        sudo ufw allow from 127.0.0.1 to any port 8080
        
        warning "UFW правила добавлены. Включите UFW командой: sudo ufw enable"
    else
        warning "UFW не найден. Настройте файрвол вручную!"
    fi
}

# Главная функция
main() {
    echo "🚀 Начинаем настройку безопасности EasyWeather..."
    echo
    
    check_docker
    create_directories
    generate_passwords
    create_postgres_config
    create_backup_script
    create_pgadmin_config
    create_monitoring
    setup_firewall
    
    echo
    success "✅ Настройка безопасности завершена!"
    echo
    echo "📋 Следующие шаги:"
    echo "1. Отредактируйте .env файл и добавьте ваши API ключи"
    echo "2. Запустите: docker-compose up -d"
    echo "3. Дождитесь инициализации базы данных"
    echo "4. Проверьте статус: ./monitor.sh"
    echo "5. Доступ к PgAdmin: http://localhost:8080"
    echo
    echo "🔐 Учетные данные по умолчанию:"
    echo "   PgAdmin: admin@easyweather.local / $(grep PGADMIN_PASSWORD .env | cut -d'=' -f2)"
    echo "   DB Admin: admin / Admin2025!"
    echo
    warning "⚠️  ОБЯЗАТЕЛЬНО измените пароли в продакшене!"
    warning "⚠️  Не забудьте добавить .env в .gitignore!"
}

# Запуск
main "$@"