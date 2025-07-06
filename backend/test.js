console.log('Начинаем тест...');
console.log('Node.js версия:', process.version);

try {
    console.log('Загружаем Express...');
    const express = require('express');
    console.log('Express загружен успешно!');
    
    const app = express();
    console.log('Express app создан!');
    
    app.get('/', (req, res) => {
        res.json({ message: 'Тест работает!' });
    });
    
    const PORT = 3001;
    console.log('Запускаем сервер на порту', PORT);
    
    app.listen(PORT, () => {
        console.log('🎉 СЕРВЕР ЗАПУЩЕН НА http://localhost:' + PORT);
    });
    
} catch (error) {
    console.error('ОШИБКА:', error);
}

console.log('Конец скрипта');