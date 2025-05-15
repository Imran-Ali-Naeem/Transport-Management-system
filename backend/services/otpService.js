const crypto = require('crypto');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Save OTP to database
const saveOTP = async (email, otp) => {
  // Delete any existing OTP for this email
  await OTP.deleteMany({ email });
  
  // Create and save new OTP
  const otpDoc = await OTP.create({ email, otp });
  return otpDoc;
};

// Send OTP via email
const sendOTP = async (email, name) => {
  try {
    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP for', email, ':', otp);

    // Save OTP to database
    const otpDoc = await saveOTP(email, otp);

    // Send OTP via email using the plain text OTP (before hashing)
    const emailSent = await sendOTPEmail(email, name, otp);
    
    if (!emailSent) {
      // If email fails, delete the OTP record
      await OTP.deleteOne({ _id: otpDoc._id });
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error in OTP process:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  // Find OTP record
  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord) {
    throw new Error('OTP not found or expired');
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    // Delete the record if max attempts reached
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new Error('Maximum verification attempts reached. Please request a new OTP.');
  }

  // Increment attempts
  otpRecord.attempts += 1;
  await otpRecord.save();

  // Verify OTP
  if (!otpRecord.verifyOTP(otp)) {
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new Error('Maximum verification attempts reached. Please request a new OTP.');
    }
    throw new Error('Invalid OTP');
  }

  // Delete OTP after successful verification
  await OTP.deleteOne({ _id: otpRecord._id });
  return true;
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
}; 