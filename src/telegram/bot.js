import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { MongoClient } from 'mongodb';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios'; // Import axios for network requests

dotenv.config(); // Ensure dotenv is configured

// MongoDB connection URI and database name
const uri = process.env.MONGO_URI; // Use environment variable
const dbName = 'proseed';

const client = new MongoClient(uri);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const app = express();
app.use(express.json());
app.use(limiter);

const token = process.env.TELEGRAM_BOT_TOKEN; // Use environment variable
const bot = new TelegramBot(token, { polling: true }); // Use polling

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);

  // Retry mechanism for polling errors
  setTimeout(() => {
    bot.startPolling();
  }, 5000); // Retry after 5 seconds
});

// Retry mechanism for network requests
const fetchData = async (url, options, retries = 3) => {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} retries left`);
      return fetchData(url, options, retries - 1);
    } else {
      throw error;
    }
  }
};

// Listen for messages and command events
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name;

  try {
    await client.connect();
    const database = client.db(dbName);
    const users = database.collection('users');

    // Register or update user
    const result = await users.updateOne(
      { telegramId: chatId },
      { $set: { telegramId: chatId, username: username } },
      { upsert: true }
    );

    // Log the result for debugging
    console.log('User registration result:', result);

    // Generate the welcome message
    const welcomeMessage = `Welcome to proSEED, ${username}!\nYour ID: ${chatId}`;

    // Define the Web App button
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Start App',
              web_app: { url: 'https://proseedtesting.netlify.app/app' }, // Open the Web App within Telegram
            },
          ],
        ],
      },
    };

    // Send the welcome message with the button
    bot.sendMessage(chatId, welcomeMessage, options);
  } catch (error) {
    console.error('Error handling /start command:', error);
  } finally {
    await client.close();
  }
});


// Handle balance command
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
  } catch (error) {
    console.error('Error handling /balance command:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching your balance.');
  } finally {
    await client.close();
  }
});

// Handle register command
bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await client.connect();
    const database = client.db(dbName);
    const existingUser = await database.collection('users').findOne({ telegramId: chatId });
    if (existingUser) {
      bot.sendMessage(chatId, 'You are already registered.');
    } else {
      await database.collection('users').insertOne({ username: msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim() || msg.from.first_name, telegramId: chatId });
      bot.sendMessage(chatId, 'Registration successful!');
    }
  } catch (error) {
    console.error('Error handling /register command:', error);
    bot.sendMessage(chatId, 'An error occurred during registration.');
  } finally {
    await client.close();
  }
});

// Handle fetchID command
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
  } catch (error) {
    console.error('Error handling /fetchID command:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching your Telegram ID.');
  } finally {
    await client.close();
  }
});

// Start express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;






