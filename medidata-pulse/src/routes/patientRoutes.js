const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');

// Patient Dashboard အချက်အလက်များ ရယူရန်
router.get('/dashboard', verifyToken, patientController.getPatientDashboard);

// Route များကို verifyToken ဖြင့် စနစ်တကျ ကာကွယ်ခြင်း
router.get('/', verifyToken, patientController.getAllPatients);
router.get('/:id', verifyToken, patientController.getPatientById);
router.post('/', verifyToken, patientController.createPatient);
router.put('/:id', verifyToken, patientController.updatePatient);
router.delete('/:id', verifyToken, patientController.deletePatient);

module.exports = router;