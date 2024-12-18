import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

const uri = 'mongodb+srv://lotanna8900:lotanna8900@proseedtesting.fnvp5.mongodb.net/?retryWrites=true&w=majority&appName=ProseedTesting';
const client = new MongoClient(uri);

export async function handler(event, context) {
  try {
    // Log the entire event and context for debugging purposes
    console.log('Received event:', JSON.stringify(event));
    console.log('Received context:', JSON.stringify(context));

    // Check if event body is not empty
    if (!event.body) {
      throw new Error('Request body is empty');
    }

    // Parse the JSON body and log it
    const body = JSON.parse(event.body);
    console.log('Parsed body:', body);

    const { message } = body;

    // Validate the message structure
    if (!message || !message.chat || !message.from) {
      throw new Error('Invalid message format');
    }

    const chatId = message.chat.id;
    const username = message.from.username;

    await client.connect();
    const database = client.db('proseed');
    const users = database.collection('users');

    const result = await users.updateOne(
      { telegramId: chatId },
      { $set: { telegramId: chatId, username: username } },
      { upsert: true }
    );

    const botToken = '7081906465:AAGouHJ-9KoKZLY5_IS0umVfFLfzVCqcoks';
    const messageText = `You have been registered. Your ID: ${chatId}`;
    const responseUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(messageText)}`;
    await fetch(responseUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully', telegramId: chatId }),
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error registering user', details: error.message }),
    };
  } finally {
    await client.close();
  }
}





