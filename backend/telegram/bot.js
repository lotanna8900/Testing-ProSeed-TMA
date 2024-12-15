const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('../config/db');
const User = require('../models/User');

// Initialize the database connection
connectDB();

// Replace with your own Telegram bot token
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Listen for messages and command events
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to proSEED! Use /help for more information.');
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await User.findOne({ walletAddress: chatId });
    if (user) {
      bot.sendMessage(chatId, `Your current PSDT balance is: ${user.psdtBalance}`);
    } else {
      bot.sendMessage(chatId, 'User not found. Please register first.');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred while fetching your balance.');
  }
});

bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const existingUser = await User.findOne({ walletAddress: chatId });
    if (existingUser) {
      bot.sendMessage(chatId, 'You are already registered.');
    } else {
      const newUser = new User({ username: msg.from.username, walletAddress: chatId });
      await newUser.save();
      bot.sendMessage(chatId, 'Registration successful!');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred during registration.');
  }
});

bot.onText(/\/fetchID/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await User.findOne({ walletAddress: chatId });
    if (user) {
      user.telegramID = chatId;
      await user.save();
      bot.sendMessage(chatId, 'Telegram ID saved successfully.');
    } else {
      bot.sendMessage(chatId, 'User not found.');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred while fetching your Telegram ID.');
  }
});
