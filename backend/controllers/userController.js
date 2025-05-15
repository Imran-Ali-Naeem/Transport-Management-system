const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Input validation middleware for create
const validateUserInput = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Please provide an email address';
  } else {
    // Append domain if not present
    const email = data.email.includes('@') ? data.email : `${data.email}@cfd.nu.edu.pk`;
    if (!email.endsWith('@cfd.nu.edu.pk')) {
      errors.email = 'Email must be a valid @cfd.nu.edu.pk address';
    }
  }
  
  if (!data.role || !['student', 'driver', 'admin'].includes(data.role)) {
    errors.role = 'Invalid role specified';
  }

  // Password validation
  if (data.password && data.password.length <= 5) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Separate validation for updates
const validateUpdateInput = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (!data.role || !['student', 'driver', 'admin'].includes(data.role)) {
    errors.role = 'Invalid role specified';
  }

  // Password validation for updates
  if (data.password && data.password.length < 5) {
    errors.password = 'Password must be at least 5 characters long';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Helper function to format email
const formatEmail = (email) => {
  return email.includes('@') ? email : `${email}@cfd.nu.edu.pk`;
};

exports.getAllUsers = async (req, res, next) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find()
      .select('name email password role createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    next(new ErrorResponse('Error fetching users', 500));
  }
};

exports.createUser = async (req, res, next) => {
  try {
    console.log('Creating new user with data:', req.body);
    const { name, password, role = 'student' } = req.body;
    let { email } = req.body;
    
    // Format email with domain
    email = formatEmail(email);
    console.log('Formatted email:', email);
    
    // Validate input
    const validationErrors = validateUserInput({ name, email, role, password });
    if (validationErrors) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: validationErrors.password || validationErrors.email || validationErrors.name || validationErrors.role || 'Validation failed'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return next(new ErrorResponse('Email already exists', 409));
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    
    console.log('User created successfully:', user._id);
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    next(new ErrorResponse('Error creating user', 500));
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    console.log('Updating user with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const { name, password, role } = req.body;
    
    // Validate update input (without email)
    const validationErrors = validateUpdateInput({ name, role, password });
    if (validationErrors) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: validationErrors.password || validationErrors.name || validationErrors.role || 'Validation failed'
      });
    }
    
    // Find user by ID
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return next(new ErrorResponse('User not found', 404));
    }

    console.log('Found user to update:', user);
    
    // Update user fields
    user.name = name;
    user.role = role;
    if (password) user.password = password;
    
    // Save the updated user
    const updatedUser = await user.save();
    console.log('User updated successfully:', updatedUser._id);
    
    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err) {
    console.error('Error in updateUser:', err);
    if (err.name === 'CastError') {
      return next(new ErrorResponse('Invalid user ID format', 400));
    }
    next(new ErrorResponse('Error updating user', 500));
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    console.log('Deleting user with ID:', req.params.id);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return next(new ErrorResponse('User not found', 404));
    }
    
    // Prevent deletion of last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        console.log('Cannot delete last admin user');
        return next(new ErrorResponse('Cannot delete the last admin user', 400));
      }
    }
    
    await user.deleteOne();
    console.log('User deleted successfully:', req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    next(new ErrorResponse('Error deleting user', 500));
  }
};