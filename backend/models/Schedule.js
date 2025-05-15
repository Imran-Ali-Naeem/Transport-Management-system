const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, required: true },
  order: { type: Number, required: true }
});

const scheduleSchema = new mongoose.Schema({
  busId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true 
  },
  stops: [stopSchema]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);