const express = require('express');
const redis = require('redis');
const app = express();
const port = process.env.PORT || 3000;

// Connect to Redis
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

// Shorten URL
app.post('/shorten', async (req, res) => {
  const longUrl = req.query.url;
  if (!longUrl) {
    return res.status(400).send('URL is required');
  }

  // Generate a short ID
  const shortId = Math.random().toString(36).substring(2, 8);
  await client.set(shortId, longUrl);

  res.send({ shortUrl: `http://localhost:${port}/${shortId}` });
});

// Redirect
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  const longUrl = await client.get(shortId);

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
