// routes/taskRoutes.js
const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware'); // Middleware to check authentication
const router = express.Router();

// Create a new task
router.post('/tasks', protect, async (req, res) => { // Change route to /tasks
    console.log('POST /tasks endpoint hit');
    const { title, priority, dueDate, checklist, status, assignedTo } = req.body;

    try {
        const task = new Task({
            title,
            priority,
            dueDate,
            checklist,
            status,
            assignedTo,
            user: req.user._id // Links the task to the logged-in user
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
});

// Get all tasks for a user
router.get('/tasks', protect, async (req, res) => { // Change route to /tasks
    try {
        // Retrieves tasks for the logged-in user only
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});

// Update a task
router.put('/tasks/:taskId', protect, async (req, res) => { // Change route to /tasks/:taskId
    const { taskId } = req.params;

    try {
        // Updates the task only if it belongs to the logged-in user
        const task = await Task.findOneAndUpdate(
            { _id: taskId, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
});

// Delete a task
router.delete('/tasks/:taskId', protect, async (req, res) => { // Change route to /tasks/:taskId
    const { taskId } = req.params;

    try {
        // Deletes the task only if it belongs to the logged-in user
        const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

module.exports = router;
