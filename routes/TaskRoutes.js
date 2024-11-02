
const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware'); 
const router = express.Router();


router.post('/tasks', protect, async (req, res) => { 
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
            user: req.user._id 
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
});


router.get('/tasks', protect, async (req, res) => { 
    try {
        
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});


router.put('/tasks/:taskId', protect, async (req, res) => { 
    const { taskId } = req.params;

    try {
       
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


router.delete('/tasks/:taskId', protect, async (req, res) => { 
    const { taskId } = req.params;

    try {
      
        const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

module.exports = router;
