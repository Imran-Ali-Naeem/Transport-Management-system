const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Log registration attempt
    console.log('Registration attempt:', { name, email });

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({
        success: false,
        error: 'This email is already registered. Please use a different email address.'
      });
    }

    // Create new user instance
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student'
    });

    // Save the user
    await user.save();
    console.log('User created successfully:', user.email);

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error details:', {
      error: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This email is already registered. Please use a different email address.'
      });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Simple password comparison
    const isMatch = user.password === password;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role
      }, 
      process.env.JWT_SECRET || 'your-jwt-secret',
      {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      }
    );

    return res.status(200).json({
      success: true,
      token,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Test password comparison
// @route   POST /api/auth/test-password
// @access  Public
exports.testPasswordComparison = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    console.log('Test password comparison for email:', email);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        email: email
      });
    }

    console.log('Found user:', {
      email: user.email,
      role: user.role,
      storedPasswordHash: user.password,
      providedPassword: password
    });

    const isMatch = await bcrypt.compare(password, user.password);
    
    return res.json({
      success: true,
      passwordMatches: isMatch,
      userFound: true,
      role: user.role
    });

  } catch (err) {
    console.error('Test password error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Test password hash
// @route   POST /api/auth/test-hash
// @access  Public
exports.testHash = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Generate a new hash
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    
    // Try to compare
    const isMatch = await bcrypt.compare(password, hash);
    
    res.json({
      success: true,
      originalPassword: password,
      generatedHash: hash,
      comparisonResult: isMatch,
      hashLength: hash.length
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
