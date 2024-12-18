const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log('Received body:', req.body);
  res.send({ message: 'Webhook received' });
});

app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
