const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// 🩺 ရက်ချိန်းစာရင်းများ ရယူရန် (Role အလိုက် Doctor ဆိုလျှင် သူ့ရက်ချိန်းများ၊ Patient ဆိုလျှင် သူ့ဟာများ)
router.get(
  '/', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'receptionist', 'admin'), 
  appointmentController.getAllAppointments
);

// 📅 ယနေ့အတွက် တန်းစီဇယား (Today Appointments) ရယူရန်
router.get(
  '/today', 
  verifyToken, 
  authorizeRoles('doctor', 'receptionist', 'admin', 'patient'), 
  appointmentController.getTodayAppointments
);

// 📊 ဒက်ရှ်ဘုတ် စာရင်းချုပ် (Summary) ကြည့်ရန်
router.get(
  '/summary', 
  verifyToken, 
  authorizeRoles('doctor', 'receptionist', 'admin'), 
  appointmentController.getDashboardSummary
);

// ➕ Patient, Receptionist နှင့် Admin တို့ ရက်ချိန်း အသစ် တောင်းဆိုနိုင်သည်
router.post(
  '/', 
  verifyToken, 
  authorizeRoles('patient', 'receptionist', 'admin'), 
  appointmentController.createAppointment
);

// 🔄 Doctor, Receptionist, Admin နှင့် Patient တို့ Status ပြောင်းလဲနိုင်သည် (Cancel လုပ်ရန် ပါဝင်သည်)
router.patch(
  '/:id/status', 
  verifyToken, 
  authorizeRoles('doctor', 'receptionist', 'admin', 'patient'), 
  appointmentController.updateAppointmentStatus
);

// 🗑️ ရက်ချိန်း ဖျက်သိမ်းရန် (Delete)
router.delete(
  '/:id', 
  verifyToken, 
  authorizeRoles('admin', 'receptionist'), 
  appointmentController.deleteAppointment
);

module.exports = router;