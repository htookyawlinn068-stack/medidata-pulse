const express = require('express');
const { 
    getDoctorSchedules, 
    upsertDoctorSchedule, 
    deleteDoctorSchedule 
} = require('../controllers/doctorScheduleController');
const { verifyToken } = require('../middleware/authMiddleware'); // ပြင်ဆင်ချက်: ကွင်းစကွင်းပိတ် {} ထည့်ရန်

const router = express.Router();

router.get('/schedules', verifyToken, getDoctorSchedules);
router.post('/schedules', verifyToken, upsertDoctorSchedule);
router.delete('/schedules/:id', verifyToken, deleteDoctorSchedule);

module.exports = router;