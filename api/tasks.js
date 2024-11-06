
import dbConnect from '../../utils/dbConnect'; 
import Task from '../../models/Task'; 
import { protect } from '../../middleware/authMiddleware'; 

export default async function handler(req, res) {
    await dbConnect(); 

   
    const user = await protect(req, res); 

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
                user: user._id 
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
        const { taskId } = req.query; 
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
        const { taskId } = req.query; 
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
