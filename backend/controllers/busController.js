const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buses', error: err.message });
  }
};

// @desc    Search buses
// @route   GET /api/buses/search
// @access  Public
const searchBuses = async (req, res) => {
  try {
    const query = req.query.query;
    const buses = await Bus.find({
      $or: [
        { busNumber: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(buses);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// @desc    Add new bus
// @route   POST /api/buses
// @access  Private (add your auth middleware later)
const addBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add bus', error: err.message });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private
const updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedBus);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update bus', error: err.message });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private
const deleteBus = async (req, res) => {
  try {
    // First delete all schedules associated with this bus
    await Schedule.deleteMany({ busId: req.params.id });
    
    // Then delete the bus
    await Bus.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Bus and associated schedules deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete bus', error: err.message });
  }
};

module.exports = {
  getBuses,
  searchBuses,
  addBus,
  updateBus,
  deleteBus
};