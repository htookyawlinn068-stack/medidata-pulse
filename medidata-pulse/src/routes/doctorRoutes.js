const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// --- Dashboard API Route (Controller ထဲရှိ getDoctorDashboardData နှင့် ချိတ်ဆက်ခြင်း) ---
router.get('/dashboard', verifyToken, authorizeRoles('doctor'), doctorController.getDoctorDashboardData);

// 1. Admin သာလျှင် ဆရာဝန်အသစ်ဖန်တီးနိုင်သည်
router.post('/admin/add', verifyToken, authorizeRoles('admin'), doctorController.createDoctorByAdmin);

// 2. ဆရာဝန်ကိုယ်တိုင်သာလျှင် မိမိ Profile ကို မြင်နိုင်/ပြင်နိုင်သည်
router.get('/profile', verifyToken, authorizeRoles('doctor'), doctorController.getDoctorProfile);
router.put('/profile', verifyToken, authorizeRoles('doctor'), doctorController.updateDoctorProfile);

// 3. Admin, Doctor, Patient, နှင့် Receptionist များ ကြည့်နိုင်သော လမ်းကြောင်းများ
router.get('/', verifyToken, authorizeRoles('admin', 'doctor', 'patient', 'receptionist'), doctorController.getAllDoctors);
router.get('/:id', verifyToken, authorizeRoles('admin', 'doctor', 'patient', 'receptionist'), doctorController.getDoctorById);

// 4. Update/Delete လုပ်ခြင်း (Admin သာလျှင် လုပ်ခွင့်ပေးခြင်း)
router.put('/:id', verifyToken, authorizeRoles('admin'), doctorController.updateDoctor);
router.delete('/:id', verifyToken, authorizeRoles('admin'), doctorController.deleteDoctor);

// 5. ရက်ချိန်းတောင်းဆိုမှုများ ရယူရန် နှင့် Status ပြောင်းရန်
router.get('/appointments/requests', verifyToken, authorizeRoles('doctor'), doctorController.getAppointmentRequests);
router.put('/appointments/:id/status', verifyToken, authorizeRoles('doctor'), doctorController.updateAppointmentStatus);

module.exports = router;