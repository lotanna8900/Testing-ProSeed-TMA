const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { username, telegramID } = JSON.parse(event.body);
    if (!username || !telegramID) {
      throw new Error('Username and Telegram ID are required');
    }
    const response = await axios.post('/api/users/register', { username, telegramID });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error registering user' }),
    };
  }
};
