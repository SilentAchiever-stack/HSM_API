const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    description: { type: String, required: true },
    status:      { type: String, default: 'open' },
    reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room:        { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
