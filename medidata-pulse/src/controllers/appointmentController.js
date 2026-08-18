const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

// 1. ရက်ချိန်း အားလုံး စာရင်း ရယူခြင်း
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctor_id } = req.query;
    let filter = {};

    if (status) filter.status = status;
    
    if (req.user && req.user.role === 'doctor') {
      const doctorDoc = await Doctor.findOne({
        $or: [{ _id: req.user.id }, { user_id: req.user.id }]
      });
      if (doctorDoc) {
        filter.doctor_id = doctorDoc._id;
      } else {
        filter.doctor_id = req.user.id;
      }
    } else if (doctor_id) {
      filter.doctor_id = doctor_id;
    }

    if (req.user && req.user.role === 'patient') {
      const patientDoc = await Patient.findOne({
        $or: [{ _id: req.user.id }, { user_id: req.user.id }]
      });
      if (patientDoc) {
        filter.patient_id = patientDoc._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filter.appointment_date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient_id', 'name phone gender age blood address allergies currentMedications')
      .populate({
        path: 'doctor_id',
        select: 'name username specialization'
      })
      .sort({ appointment_date: -1, appointment_time: 1 })
      .lean();

    const formatted = appointments.map(app => ({
      ...app,
      id: app._id,
      patient_name: app.patient_id?.name || 'Unknown Patient',
      patient_phone: app.patient_id?.phone || 'N/A',
      patient_gender: app.patient_id?.gender || 'N/A',
      patient_age: app.patient_id?.age || 'N/A',
      doctor_name: app.doctor_id?.name || app.doctor_id?.username || 'General Doctor',
      specialization: app.doctor_id?.specialization || 'General'
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. ယနေ့အတွက် Dashboard တန်းစီဇယား ရယူခြင်း
exports.getTodayAppointments = async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    
    let filter = { appointment_date: { $gte: todayStart, $lte: todayEnd } };

    if (req.user && req.user.role === 'doctor') {
      const doctorDoc = await Doctor.findOne({
        $or: [{ _id: req.user.id }, { user_id: req.user.id }]
      });
      if (doctorDoc) filter.doctor_id = doctorDoc._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient_id', 'name phone gender age blood address allergies currentMedications')
      .populate({
        path: 'doctor_id',
        select: 'name username specialization'
      })
      .sort({ appointment_time: 1 })
      .lean();

    const formatted = appointments.map(app => ({
      ...app,
      id: app._id,
      patient_id: app.patient_id || null,
      patient_name: app.patient_id?.name || 'Unknown Patient',
      patient_phone: app.patient_id?.phone || 'N/A',
      doctor_id: app.doctor_id?._id || null,
      doctor_name: app.doctor_id?.name || app.doctor_id?.username || 'General Doctor',
      specialization: app.doctor_id?.specialization || 'General'
    }));
    
    res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. ဒက်ရှ်ဘုတ် စာရင်းချုပ် ရယူခြင်း
exports.getDashboardSummary = async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    let todayFilter = { appointment_date: { $gte: todayStart, $lte: todayEnd } };
    
    if (req.user && req.user.role === 'doctor') {
      const doctorDoc = await Doctor.findOne({
        $or: [{ _id: req.user.id }, { user_id: req.user.id }]
      });
      if (doctorDoc) todayFilter.doctor_id = doctorDoc._id;
    }

    const total_today = await Appointment.countDocuments(todayFilter);
    const pending_today = await Appointment.countDocuments({ ...todayFilter, status: 'pending' });
    const confirmed_today = await Appointment.countDocuments({ ...todayFilter, status: 'confirmed' });
    const scheduled_today = await Appointment.countDocuments({ ...todayFilter, status: 'scheduled' });
    const completed_today = await Appointment.countDocuments({ ...todayFilter, status: 'completed' });
    const cancelled_today = await Appointment.countDocuments({ ...todayFilter, status: 'cancelled' });

    res.status(200).json({ 
      success: true, 
      data: { total_today, pending_today, confirmed_today, scheduled_today, completed_today, cancelled_today } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. ရက်ချိန်း အသစ် တောင်းဆိုခြင်း
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, patientId, doctor_id, doctorId, appointment_date, date, appointment_time, time, notes } = req.body;

    const finalDoctorId = doctor_id || doctorId;
    const finalDate = appointment_date || date;
    const finalTime = appointment_time || time;

    if (!finalDoctorId || !finalDate || !finalTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'ကျေးဇူးပြု၍ ဆရာဝန်၊ ရက်ချိန်းရက်စွဲနှင့် အချိန်တို့ကို အပြည့်အစုံ ဖြည့်စွက်ပါ။' 
      });
    }

    let rawPatientId = patient_id || patientId || req.user?._id || req.user?.id;

    let patientDoc = null;
    if (rawPatientId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(rawPatientId);
      patientDoc = await Patient.findOne({
        $or: [
          ...(isValidObjectId ? [{ _id: rawPatientId }] : []),
          { user_id: rawPatientId }
        ]
      });
    }

    if (!patientDoc) {
      patientDoc = await Patient.findOne();
    }

    if (!patientDoc) {
      return res.status(404).json({
        success: false,
        message: 'လူနာအချက်အလက် (Patient Profile) ကို Database တွင် ရှမတွေ့ပါ။'
      });
    }

    if (finalDate && finalTime) {
      const [hours, minutes] = finalTime.split(':').map(Number);
      const targetDateTime = new Date(finalDate);
      targetDateTime.setHours(hours || 0, minutes || 0, 0, 0);

      const now = new Date();
      const diffInHours = (targetDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'ဆရာဝန်တာဝန်ကျချိန် မတိုင်မီ ၃ နာရီအလိုမှသာ နောက်ဆုံးထားပြီး ရက်ချိန်းတင်နိုင်ပါသည်။' 
        });
      }
    }

    const newAppointment = new Appointment({
      patient_id: patientDoc._id,
      doctor_id: finalDoctorId,
      appointment_date: new Date(finalDate),
      appointment_time: finalTime,
      notes: notes || '',
      status: 'pending'
    });
    
    await newAppointment.save();
    const obj = newAppointment.toObject();
    res.status(201).json({ success: true, message: 'Appointment requested successfully', data: { ...obj, id: obj._id } });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. ဆရာဝန်/လူနာ/Receptionist မှ Status ပြောင်းလဲခြင်း (Confirmed, Scheduled, Completed, Cancelled စသည်ဖြင့်)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, diagnosis, prescription } = req.body;

    const allowedStatuses = ['pending', 'scheduled', 'confirmed', 'completed', 'missed', 'cancelled', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updateData = { status };
    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    // ဆရာဝန်မှ စစ်ဆေးမှုပြီးမြောက်၍ 'completed' ပြုလုပ်ချိန်တွင် Diagnosis နှင့် Prescription ထည့်သွင်းခြင်း
    if (status === 'completed') {
      if (diagnosis) updateData.diagnosis = diagnosis;
      if (prescription) updateData.prescription = prescription;
    }

    const updated = await Appointment.findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .populate('patient_id', 'name phone user_id')
      .populate({
        path: 'doctor_id',
        select: 'name username specialization'
      });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // လူနာထံသို့ Notification ပို့ပေးခြင်း
    if (['confirmed', 'rejected', 'accepted', 'completed', 'scheduled'].includes(status) && updated.patient_id) {
      const docName = updated.doctor_id?.name || updated.doctor_id?.username || '';
      let notifMessage = '';

      if (status === 'confirmed' || status === 'accepted') {
        notifMessage = `ဆရာဝန် ${docName} မှ သင့်ရက်ချိန်းကို အတည်ပြုလိုက်ပါပြီ။`;
      } else if (status === 'scheduled') {
        notifMessage = `သင်ဆေးခန်းသို့ ရောက်ရှိနေပြီဖြစ်ပြီး ဆရာဝန်နှင့် ပြသရန် စောင့်ဆိုင်းနေပါသည်။`;
      } else if (status === 'completed') {
        notifMessage = `ဆရာဝန် ${docName} နှင့် ပြသမှု ပြီးဆုံးသွားပါပြီ။ ဆေးစာနှင့် မှတ်တမ်းများကို ကြည့်ရှုနိုင်ပါသည်။`;
      } else if (status === 'rejected') {
        notifMessage = `ဆရာဝန်မှ ရက်ချိန်းကို ငြင်းပယ်ခဲ့ပါသည်။ အကြောင်းရင်း: ${rejection_reason || 'မရှိပါ'}`;
      }

      if (notifMessage) {
        await Notification.create({
          recipient_id: updated.patient_id._id,
          recipient_model: 'Patient',
          title: `ရက်ချိန်း ${status.toUpperCase()} ဖြစ်ပါသည်`,
          message: notifMessage,
          appointment_id: updated._id
        });
      }
    }

    // လူနာမှ ရက်ချိန်းဖျက်သိမ်းပါက ဆရာဝန်ထံသို့ Notification ပို့ခြင်း
    if (status === 'cancelled' && updated.doctor_id) {
      await Notification.create({
        recipient_id: updated.doctor_id._id,
        recipient_model: 'Doctor',
        title: `လူနာမှ ရက်ချိန်းဖျက်သိမ်းခြင်း`,
        message: `လူနာ ${updated.patient_id?.name || 'Unknown'} မှ ရက်ချိန်းကို ဖျက်သိမ်းလိုက်ပါသည်။`,
        appointment_id: updated._id
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Appointment status updated to '${status}'`, 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. ရက်ချိန်း ဖျက်သိမ်းခြင်း (Delete)
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};