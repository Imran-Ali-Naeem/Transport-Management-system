const User = require('../models/User');
const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../services/jwtService');
const { sendOTP, verifyOTP } = require('../services/otpService');

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and name'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Send OTP
    await sendOTP(email, name);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('Error in sendOTP:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send OTP'
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Verify OTP
    try {
      await verifyOTP(email, otp);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student'
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to register user'
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
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from user object
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      token,
      ...userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // User is already attached to req by protect middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return user data in exact format expected by frontend
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(new ErrorResponse('Error fetching user data', 500));
  }
};

// @desc    Test password comparison
// @route   POST /api/auth/test-password
// @access  Public
exports.testPasswordComparison = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    return res.json({
      success: true,
      passwordMatches: isMatch
    });

  } catch (err) {
    console.error('Test password error:', err);
    next(new ErrorResponse(err.message, 500));
  }
};

// @desc    Test password hash
// @route   POST /api/auth/test-hash
// @access  Public
exports.testHash = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    
    const isMatch = await bcrypt.compare(password, hash);
    
    res.json({
      success: true,
      comparisonResult: isMatch
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};