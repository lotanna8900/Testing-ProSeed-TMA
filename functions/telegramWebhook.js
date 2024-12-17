exports.handler = async (event, context) => {
    try {
      const update = JSON.parse(event.body);
      const { message } = update;
  
      if (message && message.from) {
        const telegramUser = {
          id: message.from.id,
          username: message.from.username,
          firstName: message.from.first_name,
          lastName: message.from.last_name,
        };
  
        // Register the user automatically
        await fetch('/.netlify/functions/registerUser', {
          method: 'POST',
          body: JSON.stringify({ username: telegramUser.username, walletAddress: telegramUser.id }),
        });
  
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'User registered successfully' }),
        };
      }
  
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid update' }),
      };
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error handling Telegram update' }),
      };
    }
  };
  