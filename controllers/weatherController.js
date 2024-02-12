const OPENWEATHER_API_KEY = 'c31621e8271961f1c5b100dcb3ae1565';
const axios = require('axios');
const User = require('../models/userModel');
const Weather = require('../models/weatherModel');

const saveWeatherDataToHistory = async (userId, weatherId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: { 
        history: { 
          type: 'Weather', 
          refId: weatherId 
        } 
      }
    });
  } catch (error) {
    console.error("Error updating user history with weather data:", error);
  }
};

const getWeatherData = async (req, res) => {
  try {
    const city = req.query.city || 'New York';
    const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const weatherData = weatherResponse.data;

    let weather;

    const existingWeather = await Weather.findOne({ city: city });
    if (existingWeather) {
      existingWeather.description = weatherData.weather[0].description;
      existingWeather.temperature = weatherData.main.temp;
      existingWeather.pressure = weatherData.main.pressure;
      existingWeather.windSpeed = weatherData.wind.speed;
      existingWeather.humidity = weatherData.main.humidity;
      await existingWeather.save();
      weather = existingWeather;
    } else {
      weather = await Weather.create({
        city: city,
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        longitude: weatherData.coord.lon,
        latitude: weatherData.coord.lat,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        humidity: weatherData.main.humidity,

        icon: weatherData.weather[0].icon,
      });
    }
    req.session.country= weatherData.sys.country;

    const userId = req.session.userId;
    const user = await User.findById(userId);

    await saveWeatherDataToHistory(userId, weather._id);    

    var time = new Date();
    const formattedTime = `${time.getHours()}:${time.getMinutes()}`;
    res.render('main', { time: formattedTime, user: user, weatherData: weatherData, city });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getWeatherData };
