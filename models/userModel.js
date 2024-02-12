const mongoose = require('mongoose');

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true, 
        minlength: 5
    },
    admin: {
        type: Boolean,
    },
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weather'
    }]

},{collection: 'users'})

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;