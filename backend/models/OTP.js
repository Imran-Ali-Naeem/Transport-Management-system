const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Max 5 attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // 30 minutes expiry
  }
}, {
  timestamps: true
});

// Add indexes for better performance
otpSchema.index({ email: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

// Pre-save hook to hash OTP if modified
otpSchema.pre('save', async function(next) {
  if (this.isModified('otp')) {
    // Store last 4 digits in clear text for email sending
    this._plainOtp = this.otp;
    // Hash the OTP
    const crypto = require('crypto');
    this.otp = crypto.createHash('sha256').update(this.otp).digest('hex');
  }
  next();
});

// Method to verify OTP
otpSchema.methods.verifyOTP = function(candidateOTP) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(candidateOTP).digest('hex');
  return this.otp === hash;
};

module.exports = mongoose.model('OTP', otpSchema); 