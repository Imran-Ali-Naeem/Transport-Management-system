const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  capacity: { type: Number, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, required: true },
  status: { type: String, default: 'Active' },
  lastMaintenance: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);