const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { username } = JSON.parse(event.body);
    if (!username) {
      throw new Error('Username is required');
    }
    const response = await axios.get(`/api/users/getUserID?username=${username}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ telegramID: response.data.telegramID }),
    };
  } catch (error) {
    console.error('Error fetching Telegram ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching Telegram ID' }),
    };
  }
};

