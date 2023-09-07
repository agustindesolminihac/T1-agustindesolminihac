const mongoose = require('mongoose');

const elevatorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    max_weight: Number,
    current_weight: Number,
    level: Number,
    users: [Object],
    doors: String
});

module.exports = mongoose.model('Elevator', elevatorSchema);