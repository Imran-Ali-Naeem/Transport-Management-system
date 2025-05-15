const express = require('express');
const router = express.Router();
const { 
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAvailableBuses
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSchedules);
router.post('/', protect, createSchedule);
router.put('/:id', protect, updateSchedule);
router.delete('/:id', protect, deleteSchedule);
router.get('/buses', protect, getAvailableBuses);

module.exports = router;