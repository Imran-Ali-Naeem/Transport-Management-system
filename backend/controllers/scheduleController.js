const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');

// @desc    Get all schedules with bus details
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    console.log('Fetching schedules...');
    const schedules = await Schedule.find()
      .populate({
        path: 'busId',
        select: 'busNumber model',
        model: 'Bus'
      })
      .exec();
    
    console.log('Schedules fetched:', schedules);
    res.status(200).json(schedules);
  } catch (err) {
    console.error('Error in getSchedules:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Failed to fetch schedules',
      error: err.message,
      details: err.name
    });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private
exports.createSchedule = async (req, res) => {
  try {
    const { busId, stops } = req.body;
    
    // Validate at least 2 stops
    if (!stops || stops.length < 2) {
      return res.status(400).json({ message: 'At least two stops are required' });
    }

    // Add order to stops
    const orderedStops = stops.map((stop, index) => ({
      ...stop,
      order: index + 1
    }));

    const schedule = new Schedule({
      busId,
      stops: orderedStops
    });

    await schedule.save();
    
    // Populate bus details before sending response
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate({
        path: 'busId',
        select: 'busNumber model',
        model: 'Bus'
      })
      .exec();

    res.status(201).json(populatedSchedule);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create schedule', error: err.message });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = async (req, res) => {
  try {
    const { busId, stops } = req.body;
    
    // Validate at least 2 stops
    if (!stops || stops.length < 2) {
      return res.status(400).json({ message: 'At least two stops are required' });
    }

    // Add order to stops
    const orderedStops = stops.map((stop, index) => ({
      name: stop.name,
      time: stop.time,
      order: index + 1
    }));

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { busId, stops: orderedStops },
      { new: true, runValidators: true }
    ).populate({
      path: 'busId',
      select: 'busNumber model',
      model: 'Bus'
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json(schedule);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update schedule', error: err.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete schedule', error: err.message });
  }
};

// @desc    Get available buses for dropdown
// @route   GET /api/schedules/buses
// @access  Private
exports.getAvailableBuses = async (req, res) => {
  try {
    const buses = await Bus.find(
      { status: 'Active' }, 
      'busNumber model _id' // Only these fields
    );
    res.status(200).json(buses);
  } catch (err) {
    console.error('Error fetching buses:', err);
    res.status(500).json({ 
      message: 'Failed to fetch available buses',
      error: err.message 
    });
  }
};