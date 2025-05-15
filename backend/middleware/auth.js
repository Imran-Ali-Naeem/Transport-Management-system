const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../services/jwtService');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify user role matches token role
      if (user.role !== decoded.role) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token - role mismatch'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
}; 

