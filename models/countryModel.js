const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const countrySchema = new Schema({
    countryCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    capital: {
        type: String
    },
    population: {
        type: Number
    }
}, { timestamps: true });

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
