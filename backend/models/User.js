const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value) && value.endsWith('@cfd.nu.edu.pk');
      },
      message: 'Please provide a valid @cfd.nu.edu.pk email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'driver', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true,
  strict: 'throw', // This will throw an error if we try to save fields that aren't in the schema
  strictQuery: true // This ensures queries are also strict
});

// Pre-save hook to handle email
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Simple password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', UserSchema);