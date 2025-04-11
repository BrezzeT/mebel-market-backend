const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Публичные маршруты
router.post('/login', loginUser);

// Защищенные маршруты
router.get('/profile', protect, getUserProfile);

module.exports = router; 