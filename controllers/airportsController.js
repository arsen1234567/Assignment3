const axios = require('axios');
const User = require('../models/userModel');
const Airport = require('../models/airportModel');

const AMADEUS_CLIENT_ID = 'NVvtcNhS88FTogG9SzSOmpMlPTTd518F';
const AMADEUS_CLIENT_SECRET = 'NnwA4Gh04GPAJGED';

const getAmadeusAccessToken = async () => {
    try {
        const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining Amadeus access token:', error);
        return null;
    }
};

const findAirportByCityName = async (cityName) => {
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) {
        console.log('Failed to obtain Amadeus access token.');
        return null;
    }

    try {
        const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(cityName)}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching for airport:', error);
        return null;
    }
};

const getAirportsInfo = async (req, res) => {
    const cityName = req.params.cityName;
    const airportsResponse = await findAirportByCityName(cityName);

    if (!airportsResponse || !airportsResponse.data || !Array.isArray(airportsResponse.data)) {
        res.status(500).send('Failed to fetch airports data');
        return;
    }

    const airportsData = airportsResponse.data;

    try {
        const userId = req.session.userId;
        for (const airport of airportsData) {
            let savedAirport = await Airport.findOne({ iataCode: airport.iataCode });
            if (!savedAirport) {
                savedAirport = new Airport({
                    city: cityName,
                    name: airport.name,
                    iataCode: airport.iataCode,
                });
                await savedAirport.save();
            }

            await User.findByIdAndUpdate(userId, {
                $push: {
                    history: {
                        type: 'Airport',
                        refId: savedAirport._id
                    }
                }
            });
        }

        res.render('airports-info', { airportsData });
    } catch (error) {
        console.error('Error saving airport data:', error);
        res.status(500).send('Failed to save airport data');
    }
};

module.exports = { getAirportsInfo };
