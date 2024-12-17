const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    console.log('Received event:', event);
    const { username, walletAddress } = JSON.parse(event.body);
    if (!username || !walletAddress) {
      throw new Error('Username and wallet address are required');
    }
    const apiUrl = 'https://proseedtesting.netlify.app/.netlify/functions/registerUser'; // Your actual API endpoint
    const response = await axios.post(apiUrl, { username, walletAddress });
    console.log('User registered successfully:', response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error registering user', details: error.message }),
    };
  }
};






