const express = require('express');
const router = express.Router();
const { 
  getBuses,
  searchBuses,
  addBus,
  updateBus,
  deleteBus 
} = require('../controllers/busController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBuses);
router.get('/search', protect, searchBuses);
router.post('/', protect, addBus);
router.put('/:id', protect, updateBus);
router.delete('/:id', protect, deleteBus);

module.exports = router;