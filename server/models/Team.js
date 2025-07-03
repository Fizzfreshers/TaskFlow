const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users belonging to this team
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // The user who created the team
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);