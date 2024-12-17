const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');

// MongoDB connection URI and database name
const uri = 'mongodb+srv://lotanna8900:lotanna8900@proseedtesting.fnvp5.mongodb.net/?retryWrites=true&w=majority&appName=ProseedTesting';
const dbName = 'proseed';

// Initialize the database connection
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Implement rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const app = express();
app.use(express.json());
app.use(limiter);

// Telegram bot token
const token = '7081906465:AAGouHJ-9KoKZLY5_IS0umVfFLfzVCqcoks';
const bot = new TelegramBot(token, { webHook: true });

// Set the webhook endpoint
bot.setWebHook(`https://proseedtesting.netlify.app/.netlify/functions/webhook`);

// Webhook endpoint to process updates from Telegram
app.post('/webhook', async (req, res) => {
  try {
    const { message } = req.body;
    const chatId = message.chat.id;
    const username = message.from.username;

    await client.connect();
    const database = client.db(dbName);
    const users = database.collection('users');

    // Register user
    await users.updateOne(
      { telegramId: chatId },
      { $set: { telegramId: chatId, username: username } },
      { upsert: true }
    );

    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  } finally {
    await client.close();
  }
});

// Listen for messages and command events
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to proSEED! Use /help for more information.');
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await client.connect();
    const database = client.db(dbName);
    const user = await database.collection('users').findOne({ telegramId: chatId });
    if (user) {
      bot.sendMessage(chatId, `Your current PSDT balance is: ${user.psdtBalance}`);
    } else {
      bot.sendMessage(chatId, 'User not found. Please register first.');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred while fetching your balance.');
  } finally {
    await client.close();
  }
});

bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await client.connect();
    const database = client.db(dbName);
    const existingUser = await database.collection('users').findOne({ telegramId: chatId });
    if (existingUser) {
      bot.sendMessage(chatId, 'You are already registered.');
    } else {
      await database.collection('users').insertOne({ username: msg.from.username, telegramId: chatId });
      bot.sendMessage(chatId, 'Registration successful!');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred during registration.');
  } finally {
    await client.close();
  }
});

bot.onText(/\/fetchID/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await client.connect();
    const database = client.db(dbName);
    const user = await database.collection('users').findOne({ telegramId: chatId });
    if (user) {
      user.telegramID = chatId;
      await database.collection('users').updateOne({ telegramId: chatId }, { $set: { telegramID: chatId } });
      bot.sendMessage(chatId, 'Telegram ID saved successfully.');
    } else {
      bot.sendMessage(chatId, 'User not found.');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'An error occurred while fetching your Telegram ID.');
  } finally {
    await client.close();
  }
});

// Export the app for Vercel's serverless functions
module.exports = app;