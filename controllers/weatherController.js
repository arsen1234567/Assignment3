const OPENWEATHER_API_KEY = 'c31621e8271961f1c5b100dcb3ae1565';
const axios = require('axios');
const User = require('../models/userModel');
const Weather = require('../models/weatherModel');

// Example URL, replace with the actual Country API URL and endpoint
const COUNTRY_API_URL = 'https://restcountries.com/v3.1/alpha/';

const getWeatherData = async (req, res) => {
  try {
    const city = req.query.city || 'Astana';
    const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const weatherData = weatherResponse.data;

    // Fetch country data
    const countryResponse = await axios.get(`${COUNTRY_API_URL}${weatherData.sys.country}`); // Assuming country API expects country code
    const countryData = countryResponse.data;

    let weather;

    const existingWeather = await Weather.findOne({ city: city });
    if (existingWeather) {
      existingWeather.description = weatherData.weather[0].description;
      existingWeather.temperature = weatherData.main.temp;
      existingWeather.pressure = weatherData.main.pressure;
      existingWeather.windSpeed = weatherData.wind.speed;
      existingWeather.humidity = weatherData.main.humidity;
      existingWeather.countryName = countryData[0].name.common,
      existingWeather.countryCapital = countryData[0].capital,
      existingWeather.countryPopulation = countryData[0].popilation,
      await existingWeather.save();
      weather = existingWeather;
    } else {
      weather = await Weather.create({
        city: city,
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        longitude: weatherData.coord.lon,
        latitude: weatherData.coord.lat, // Corrected typo from 'latitiude' to 'latitude'
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
        icon: weatherData.weather[0].icon,
        countryName: countryData[0].name.common,
        countryCapital: countryData[0].capital,
        countryPopulation: countryData[0].population,
      });
    }

    const userId = req.session.userId;
    const user = await User.findById(userId);

    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { history: weather._id }
      });
    } catch (error) {
      console.error("Error updating user history:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    var time = new Date();
    const formattedTime = `${time.getHours()}:${time.getMinutes()}`;
    console.log(countryData);
    res.render('main', { time: formattedTime, user: user, weatherData: weatherData, countryData: countryData, city });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getWeatherData };
