from telebot import TeleBot, types

import os
TOKEN = os.environ.get('TELEGRAM_TOKEN')
bot = TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    webApp = types.WebAppInfo("https://easyweather.ru")
    markup.add(types.KeyboardButton(text="Открыть EasyWeather 🌦️", web_app=webApp))
    bot.send_message(
        message.chat.id,
        "Привет! Жми на кнопку ниже, чтобы посмотреть погоду 👇",
        reply_markup=markup
    )

bot.polling()