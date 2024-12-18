import fetch from 'node-fetch';

export const handler = async (event, context) => {
  try {
    const { userId, newBalance } = JSON.parse(event.body);
    if (!userId || newBalance === undefined) {
      throw new Error('User ID and new balance are required');
    }

    // Use the Netlify function endpoint
    const apiUrl = `https://proseedtesting.netlify.app/.netlify/functions/updateBalance`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, balance: newBalance })
    });
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error updating balance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error updating balance', details: error.message }),
    };
  }
};



