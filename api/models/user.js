const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: String,
    weight: Number,
    destination: Number
});

module.exports = mongoose.model('User', userSchema);