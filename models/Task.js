const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    scheduledTime: { type: Date, required: true },
    email: { type: String, required: true },
    reminderSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Task', taskSchema);
