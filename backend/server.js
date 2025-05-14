require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

// Connect to DB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nu_cfd_transport', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, // Build indexes
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  socketTimeoutMS: 45000, // Close sockets after 45s
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
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
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
