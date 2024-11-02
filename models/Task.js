// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    checklist: {
        type: [{
            item: String,
            completed: Boolean
        }],
        default: []
    },
    status: {
        type: String,
        enum: ['Backlog', 'To Do', 'In Progress', 'Done'],
        default: 'To Do'
    },
    assignedTo: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Ensures each task is associated with a specific user
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
