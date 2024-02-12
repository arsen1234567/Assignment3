const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const airportSchema = new Schema({
    city: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    iataCode: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Airport = mongoose.model('Airport', airportSchema);

module.exports = Airport;
