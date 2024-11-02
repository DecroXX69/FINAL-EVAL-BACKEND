// server.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/TaskRoutes'); // Correct casing for taskRoutes
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/user_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log('MongoDB connection error', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes); // Use task routes without protect here

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
