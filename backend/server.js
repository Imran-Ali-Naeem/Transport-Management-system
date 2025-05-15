const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);

// Error Handler
app.use(errorHandler);

// Connect to DB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nu_cfd_transport', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('MongoDB Connected Successfully');
  console.log('Connection URL:', process.env.MONGO_URI);
  
  // Ensure indexes are created
  await User.createIndexes();
  console.log('Database indexes ensured');
  
  await cleanupDatabase();
  await resetAllPasswords();
  await createDefaultAdmin();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Function to reset all passwords to plain text
const resetAllPasswords = async () => {
  try {
    console.log('Resetting all user passwords to plain text...');
    
    // Reset student password
    await User.updateOne(
      { email: 'ua622339@cfd.nu.edu.pk' },
      { $set: { password: 'password123' } }
    );
    
    // Reset admin password
    await User.updateOne(
      { email: 'admin@cfd.nu.edu.pk' },
      { $set: { password: 'password123' } }
    );
    
    console.log('All passwords have been reset to plain text');
  } catch (err) {
    console.error('Error resetting passwords:', err);
  }
};

const createDefaultAdmin = async () => {
  try {
    console.log('Checking for existing admin...');
    const adminExists = await User.findOne({ email: 'admin@cfd.nu.edu.pk' });
    if (!adminExists) {
      console.log('No admin found, creating default admin...');
      const admin = await User.create({
        email: 'admin@cfd.nu.edu.pk',
        password: 'password123', // Store plain password
        role: 'admin'
      });
      console.log('Default admin created successfully:', admin.email);
    } else {
      console.log('Admin already exists:', adminExists.email);
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
};

// Function to cleanup database
const cleanupDatabase = async () => {
  try {
    console.log('Cleaning up database schema...');
    
    // Get all users
    const users = await User.find({});
    
    // Update each user to only include valid fields
    for (const user of users) {
      const cleanUser = {
        name: user.name || '',
        email: user.email,
        password: user.password,
        role: user.role || 'student'
      };
      
      await User.findByIdAndUpdate(user._id, cleanUser, { 
        new: true,
        runValidators: true,
        strict: true
      });
    }
    
    console.log('Database cleanup completed');
  } catch (err) {
    console.error('Error during database cleanup:', err);
  }
};
