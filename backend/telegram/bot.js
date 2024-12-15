const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('../config/db');
const User = require('../models/User');

// Initialize the database connection
connectDB();

// Replace with your own Telegram bot token
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Telegram Bot Token not provided!");
  process.exit(1);
} else {
  console.log("Telegram Bot Token is provided");
}

const bot = new TelegramBot(token, { webHook: true });
const app = express();
app.use(express.json());

// Set the webhook endpoint
bot.setWebHook(`https://testing-pro-seed-tma-git-main-lotannas-projects-15b9a9b3.vercel.app/webhook`);

app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000; // Use the PORT environment variable provided by Vercel
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
