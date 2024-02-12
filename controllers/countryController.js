const axios = require('axios');
const User = require('../models/userModel');
const Country = require('../models/countryModel');
const COUNTRY_API_URL = 'https://restcountries.com/v3.1/alpha/';

const saveCountryDataToHistory = async (userId, countryId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                history: {
                    type: 'Country',
                    refId: countryId
                }
            }
        });
    } catch (error) {
        console.error("Error updating user history with country data:", error);
    }
};


const getCountryInfo = async (req, res) => {
    const countryCode = req.params.countryCode;
    try {
        const response = await axios.get(`${COUNTRY_API_URL}${countryCode}`);
        const countryData = response.data[0];

        const existingCountry = await Country.findOne({ countryCode: countryCode });
        let country;
        if (existingCountry) {
            existingCountry.name = countryData.name.common;
            existingCountry.capital = countryData.capital ? countryData.capital[0] : null;
            existingCountry.population = countryData.population;
            await existingCountry.save();
            country = existingCountry;
        } else {
            country = await Country.create({
                countryCode: countryCode,
                name: countryData.name.common,
                capital: countryData.capital ? countryData.capital[0] : null,
                population: countryData.population
            });
        }

        const userId = req.session.userId;
        await saveCountryDataToHistory(userId, country._id);

        res.render('country-info', { countryData });
    } catch (error) {
        console.error('Error fetching country data:', error);
        res.status(500).send('Error fetching country data');
    }
};

module.exports = { getCountryInfo }; 