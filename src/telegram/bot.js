import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { MongoClient } from 'mongodb';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config(); // Ensure dotenv is configured

// MongoDB connection URI and database name
const uri = process.env.MONGO_URI;  // Use environment variable
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
const token = process.env.TELEGRAM_BOT_TOKEN; // Use environment variable
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
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  // Generate the welcome message
  const welcomeMessage = `Welcome to proSEED, ${username}!\nYour ID: ${chatId}`;
  
  // Define the button
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Start App',
            url: 'https://proseedtesting.netlify.app/app',  // Update this URL to your mini app's link
          },
        ],
      ],
    },
  };
  
  bot.sendMessage(chatId, welcomeMessage, options);
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

// Export the app for serverless functions
export default app;

