import { MongoClient } from 'mongodb';

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

    await users.updateOne(
      { telegramId: chatId },
      { $set: { telegramId: chatId, username: username } },
      { upsert: true }
    );

    // Acknowledge the update
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully', telegramId: chatId }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error processing webhook', details: error.message }),
    };
  } finally {
    await client.close();
  }
}






