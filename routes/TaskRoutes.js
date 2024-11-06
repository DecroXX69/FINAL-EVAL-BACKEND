const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, async (req, res) => { 
    const { title, priority, dueDate, checklist, status, assignedTo} = req.body;

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


router.get('/', protect, async (req, res) => { 
    try {
        
        const tasks = await Task.find({ user: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks', error });
    }
});


router.put('/:taskId', protect, async (req, res) => { 
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


router.delete('/:taskId', protect, async (req, res) => { 
    const { taskId } = req.params;

    try {
        
        const task = await Task.findOneAndDelete({ _id: taskId, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});


// In taskRoutes.js or similar
router.get('/analytics', protect, async (req, res) => {
    try {
        // Extract the user ID from the protect middleware
        const userId = req.user._id;

        // Count documents filtered by user ID and task status/priority
        const backlogCount = await Task.countDocuments({ user: userId, status: 'Backlog' });
        const toDoCount = await Task.countDocuments({ user: userId, status: 'To Do' });
        const inProgressCount = await Task.countDocuments({ user: userId, status: 'In Progress' });
        const completedCount = await Task.countDocuments({ user: userId, status: 'Done' });

        const highPriorityCount = await Task.countDocuments({ user: userId, priority: 'High Priority' });
        const mediumPriorityCount = await Task.countDocuments({ user: userId, priority: 'Medium Priority' });
        const lowPriorityCount = await Task.countDocuments({ user: userId, priority: 'Low Priority' });

        // Due tasks: count tasks with an existing due date that belong to the user
        const dueTasksCount = await Task.countDocuments({ user: userId, dueDate: { $exists: true } });

        // Send the response with filtered task counts
        res.json({
            backlog: backlogCount,
            toDo: toDoCount,
            inProgress: inProgressCount,
            completed: completedCount,
            highPriority: highPriorityCount,
            mediumPriority: mediumPriorityCount,
            lowPriority: lowPriorityCount,
            dueTasks: dueTasksCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
});

// routes/task.js
router.get('/view/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error });
    }
});

// Assuming you’re using Express.js
// PUT route to update a specific checklist item status
router.put('/:taskId/checklist/:itemIndex', protect, async (req, res) => {
    const { taskId, itemIndex } = req.params; // Make sure you are extracting params correctly
    const { completed } = req.body; // Make sure this is what you are sending

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Make sure itemIndex is a valid number
        const index = parseInt(itemIndex, 10);
        if (index < 0 || index >= task.checklist.length) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }

        // Update the checklist item's completed status
        task.checklist[index].completed = completed; // This should update the completed status
        await task.save(); // Save the task after updating

        return res.json(task); // Return the updated task
    } catch (error) {
        console.error('Error updating checklist:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Failed to update checklist', error });
    }
});





module.exports = router;