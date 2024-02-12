const express = require('express');
const { getCountryInfo } = require('../controllers/countryController');

const router = express.Router();

router.get('/info/:countryCode', getCountryInfo);

module.exports = router;