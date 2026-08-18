const express = require('express');
const router = express.Router();
const { getConsultations, createConsultation } = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth'); // သင့်ရဲ့ Auth Middleware 

router.route('/')
  .get(protect, getConsultations)
  .post(protect, authorize('doctor', 'admin'), createConsultation);

module.exports = router;