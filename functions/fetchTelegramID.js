import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://lotanna8900:lotanna8900@proseedtesting.fnvp5.mongodb.net/?retryWrites=true&w=majority&appName=ProseedTesting';
const client = new MongoClient(uri);

export const handler = async (event, context) => {
  try {
    const { telegramID } = JSON.parse(event.body);
    if (!telegramID) {
      throw new Error('Telegram ID is required');
    }

    await client.connect();
    const database = client.db('proseed');
    const users = database.collection('users');

    const user = await users.findOne({ telegramID });

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    console.error('Error fetching Telegram ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching Telegram ID', details: error.message }),
    };
  } finally {
    await client.close();
  }
};





