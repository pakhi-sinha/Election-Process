const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');

const app = express();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

exports.api = onRequest(app);
