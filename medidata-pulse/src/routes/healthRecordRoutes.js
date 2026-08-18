const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, healthRecordController.getHealthRecords);

module.exports = router;