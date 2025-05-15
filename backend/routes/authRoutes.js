const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  sendOTP, 
  testPasswordComparison, 
  testHash 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);

// Protected routes
router.get('/me', protect, getMe);

// Test routes (if needed)
router.post('/test-password', testPasswordComparison);
router.post('/test-hash', testHash);

module.exports = router;