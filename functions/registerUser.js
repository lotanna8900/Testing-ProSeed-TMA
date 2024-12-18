import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://lotanna8900:lotanna8900@proseedtesting.fnvp5.mongodb.net/?retryWrites=true&w=majority&appName=ProseedTesting';
const client = new MongoClient(uri);

export const handler = async (event, context) => {
  try {
    const { username, walletAddress } = JSON.parse(event.body);
    if (!username || !walletAddress) {
      throw new Error('Username and wallet address are required');
    }

    await client.connect();
    const database = client.db('proseed');
    const users = database.collection('users');

    const result = await users.insertOne({ username, walletAddress, psdtBalance: 0 });

    return {
      statusCode: 201,
      body: JSON.stringify(result.ops[0]),
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
};







