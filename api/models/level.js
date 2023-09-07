const mongoose = require('mongoose');

const levelSchema = mongoose.Schema({
    _id: Number,
    users: [Object]
});

module.exports = mongoose.model('Level', levelSchema);