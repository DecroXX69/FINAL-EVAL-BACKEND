const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

router.get('/validate-token', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    return res.status(200).json({ message: 'Token is valid', expiresAt: decoded.exp });
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    newUser.isNewUser = true;
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
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
});

router.post('/add-people', async (req, res) => {
  const { email , addedBy } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required to add a person' });
  }

  try {
    const existingUser = await User.findOne({ email, addedBy });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({ email,userType:'added',addedBy });
    newUser.setIsNewUser(false); 
    await newUser.save();

    res.status(201).json({ message: 'Person added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
      const users = await User.find({}, 'name email userType addedBy'); 
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update', protect, async (req, res) => {
  try {
      console.log('Request body:', req.body);
      const { name, email, oldPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
          console.error('User not found');
          return res.status(404).json({ message: 'User not found' });
      }

      if (oldPassword) {
          const isMatch = await user.comparePassword(oldPassword);
          if (!isMatch) {
              console.error('Old password is incorrect');
              return res.status(400).json({ message: 'Old password is incorrect' });
          }
      }

      user.name = name || user.name;
      user.email = email || user.email;
      if (newPassword) {
          user.password = newPassword; // Ensure password hashing in the model
      }

      await user.save();
      console.log('User updated successfully');
      res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
      console.error('Error updating user details:', error); // More detailed log
      res.status(500).json({ message: 'Error updating user details' });
  }
});



module.exports = router;
