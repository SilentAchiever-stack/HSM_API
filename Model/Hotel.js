const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    address:     { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
