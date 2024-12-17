const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { userId, newBalance } = JSON.parse(event.body);
    if (!userId || newBalance === undefined) {
      throw new Error('User ID and new balance are required');
    }

    // Ensure the correct API endpoint is used
    const apiUrl = `https://proseedtesting.netlify.app/.netlify/functions/updateBalance`; // Replace with your actual API endpoint

    const response = await axios.put(apiUrl, { balance: newBalance });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error updating balance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error updating balance', details: error.message }),
    };
  }
};

