const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription } = require('../controllers/prescriptionController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware'); // သို့မဟုတ် project ရှိ သင့်လျော်သော auth middleware

router.route('/')
  .get(verifyToken, authorizeRoles('patient', 'doctor', 'admin'), getPrescriptions)
  .post(verifyToken, authorizeRoles('doctor', 'admin'), createPrescription);

module.exports = router;