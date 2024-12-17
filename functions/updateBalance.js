const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { userId, newBalance } = JSON.parse(event.body);
    const response = await axios.put(`/api/users/${userId}/balance`, { balance: newBalance });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error updating balance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error updating balance' }),
    };
  }
};
