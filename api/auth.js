// api/auth.js
import dbConnect from '../../utils/dbConnect'; // Utility function to connect to MongoDB
import User from '../../models/User'; // Adjust path based on your structure
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export default async function handler(req, res) {
    await dbConnect(); // Connect to the database

    if (req.method === 'POST') {
        const { action, name, email, password } = req.body;

        switch (action) {
            case 'register':
                if (!name || !email || !password) {
                    return res.status(400).json({ message: 'Name, email, and password are required' });
                }
                try {
                    const existingUser = await User.findOne({ email });
                    if (existingUser) {
                        return res.status(400).json({ message: 'User already exists' });
                    }

                    const newUser = new User({ name, email, password });
                    await newUser.save();
                    res.status(201).json({ message: 'User registered successfully' });
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
                break;

            case 'login':
                if (!email || !password) {
                    return res.status(400).json({ message: 'Email and password are required' });
                }
                try {
                    const user = await User.findOne({ email });
                    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

                    const isMatch = await user.comparePassword(password);
                    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

                    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
                    res.json({ token, name: user.name, message: 'Logged in successfully' });
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
                break;
            
                case 'add-people':
                    const { email, addedBy } = req.body; // Include addedBy in request body
                    if (!email || !addedBy) {
                        return res.status(400).json({ message: 'Email and addedBy are required' });
                    }
                    try {
                        let user = await User.findOne({ email });
                        if (!user) {
                            // Create a new user if not found
                            user = new User({ email, userType: 'added', addedBy }); // Include addedBy when creating the user
                            await user.save();
                        }
                
                        // Populate addedBy with the corresponding email
                        const addedByUser = await User.findById(addedBy);
                        if (addedByUser) {
                            user = {
                                ...user.toObject(),
                                addedByEmail: addedByUser.email, // Add the email to the response
                            };
                        }
                
                        res.status(200).json({ message: 'User added successfully', user });
                    } catch (error) {
                        console.error('Server error:', error); // Add detailed logging
                        res.status(500).json({ error: error.message });
                    }
                
                                    break;
                

            // Add more cases for other actions as needed (e.g., adding people)
            default:
                res.status(400).json({ message: 'Invalid action' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
