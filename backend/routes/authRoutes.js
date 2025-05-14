const express = require('express');
const router = express.Router();
const { register, login, testPasswordComparison, getMe, testHash } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/test-password', testPasswordComparison);
router.post('/test-hash', testHash);
router.get('/me', protect, getMe);

module.exports = router;