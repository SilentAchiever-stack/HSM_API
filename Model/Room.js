const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    room_number: { type: String, required: true },
    type:        { type: String, required: true },
    price:       { type: Number, required: true },
    status:      { type: String, default: 'available' },
    imageUrl:    { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
