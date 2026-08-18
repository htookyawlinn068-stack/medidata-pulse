const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// 🌟 Destructure လုပ်ပြီး verifyToken function ကို တိုက်ရိုက်ယူသုံးပါ
const { verifyToken } = require('../middleware/authMiddleware'); 

// API Endpoints
router.get('/', verifyToken, notificationController.getMyNotifications);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;