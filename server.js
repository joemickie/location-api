require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Endpoint to get greeting message
app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name;

  if (!visitorName) {
    return res.status(400).json({ error: 'visitor_name query parameter is required' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    // Get location information from ipstack
    const locationResponse = await axios.get(`http://api.ipstack.com/${clientIp}?access_key=${IPSTACK_API_KEY}`);
    const locationData = locationResponse.data;
    const city = locationData.city || 'Unknown';
    const latitude = locationData.latitude;
    const longitude = locationData.longitude;

    // Get temperature information from OpenWeatherMap
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`);
    const weatherData = weatherResponse.data;
    const temperature = weatherData.main.temp;

    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`;

    res.json({
      client_ip: clientIp,
      location: city,
      greeting: greeting
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
