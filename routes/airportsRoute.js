const express = require('express');
const { getAirportsInfo } = require('../controllers/airportsController');
const router = express.Router();

router.get('/info/:cityName', getAirportsInfo);

module.exports = router;
