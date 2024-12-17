const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    console.log('Received event:', event);
    const { username } = JSON.parse(event.body);
    if (!username) {
      throw new Error('Username is required');
    }
    const apiUrl = 'https://proseedtesting.netlify.app/.netlify/functions/fetchTelegramID'; // Your actual API endpoint
    const response = await axios.get(`${apiUrl}?username=${username}`);
    console.log('Telegram ID fetched successfully:', response.data);
    return {
      statusCode: 200,
      body: JSON.stringify({ telegramID: response.data.telegramID }),
    };
  } catch (error) {
    console.error('Error fetching Telegram ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching Telegram ID', details: error.message }),
    };
  }
};




