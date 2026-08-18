const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, receptionController.getReceptionDashboard);

module.exports = router;