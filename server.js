const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/TaskRoutes'); // Ensure the correct casing
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log('Middleware hit');
  console.log(`${req.method} request made to: ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/user_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log('MongoDB connection error', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes); // Removed protect from here as it is already in taskRoutes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
