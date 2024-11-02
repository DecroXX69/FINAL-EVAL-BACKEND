// api/tasks.js
import dbConnect from '../../utils/dbConnect'; // Utility function to connect to MongoDB
import Task from '../../models/Task'; // Adjust path based on your structure
import { protect } from '../../middleware/authMiddleware'; // You may need to adjust this

export default async function handler(req, res) {
    await dbConnect(); // Connect to the database

    // Handle authentication here, or you may want to do it in a middleware
    const user = await protect(req, res); // Adjust this based on how you want to check the user

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'POST') {
        const { title, priority, dueDate, checklist, status, assignedTo } = req.body;

        try {
            const task = new Task({
                title,
                priority,
                dueDate,
                checklist,
                status,
                assignedTo,
                user: user._id // Links the task to the logged-in user
            });
            await task.save();
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ message: 'Error creating task', error });
        }
    } else if (req.method === 'GET') {
        try {
            const tasks = await Task.find({ user: user._id });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving tasks', error });
        }
    } else if (req.method === 'PUT') {
        const { taskId } = req.query; // Change the way you get taskId if needed
        try {
            const task = await Task.findOneAndUpdate(
                { _id: taskId, user: user._id },
                req.body,
                { new: true, runValidators: true }
            );
            if (!task) return res.status(404).json({ message: 'Task not found' });
            res.json(task);
        } catch (error) {
            res.status(500).json({ message: 'Error updating task', error });
        }
    } else if (req.method === 'DELETE') {
        const { taskId } = req.query; // Change the way you get taskId if needed
        try {
            const task = await Task.findOneAndDelete({ _id: taskId, user: user._id });
            if (!task) return res.status(404).json({ message: 'Task not found' });
            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting task', error });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
