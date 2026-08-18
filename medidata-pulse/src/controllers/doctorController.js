const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// 1. ဆရာဝန် အားလုံး စာရင်း ရယူခြင်း
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user_id', 'username email').sort({ _id: 1 });
    const formattedDoctors = doctors.map(doc => {
      const docObj = doc.toObject();
      return {
        ...docObj,
        id: docObj._id,
        name: docObj.user_id?.username || docObj.name || 'Unknown Doctor',
        email: docObj.user_id?.email || docObj.email || ''
      };
    });
    res.status(200).json({ success: true, data: formattedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. ID ဖြင့် ဆရာဝန် တစ်ဦးတည်း စာရင်း ရယူခြင်း
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const docObj = doctor.toObject();
    res.status(200).json({ 
      success: true, 
      data: { 
        ...docObj, 
        id: docObj._id,
        name: docObj.name || '',
        email: docObj.email || ''
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Admin မှ ဆရာဝန်အကောင့်အသစ် ဖန်တီးခြင်း
exports.createDoctorByAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username: name, email, password: hashedPassword, role: 'doctor' });
    await newUser.save();

    const newDoctor = new Doctor({
      user_id: newUser._id,
      name,
      email,
      is_profile_completed: false
    });
    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. ဆရာဝန်က မိမိ၏ Profile အချက်အလက်များကို ယူခြင်း
exports.getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let doctor = await Doctor.findOne({ user_id: userId }).populate('user_id', 'username email');

    if (!doctor) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      doctor = await Doctor.findOne({ email: user.email });
      if (doctor) {
        doctor.user_id = user._id;
        if (!doctor.name) doctor.name = user.username;
        if (!doctor.email) doctor.email = user.email;
        await doctor.save();
      } else {
        doctor = new Doctor({
          user_id: user._id,
          name: user.username,
          email: user.email,
          is_profile_completed: false
        });
        await doctor.save();
      }
      doctor = await Doctor.findById(doctor._id).populate('user_id', 'username email');
    }

    const docObj = doctor.toObject();
    
    const doctorName = docObj.user_id?.username || docObj.name || '';
    const doctorEmail = docObj.user_id?.email || docObj.email || '';

    res.status(200).json({
      success: true,
      doctor: { 
        ...docObj, 
        id: docObj._id,
        name: doctorName,
        email: doctorEmail
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. ဆရာဝန်က Profile ဖြည့်စွက်ခြင်း/ပြင်ဆင်ခြင်း
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { qualification, specialization, phone, available_days, available_time } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { user_id: userId },
      { 
        qualification, 
        specialization, 
        phone, 
        available_days, 
        available_time, 
        is_profile_completed: true,
        ...(user && { name: user.username, email: user.email })
      },
      { returnDocument: 'after', upsert: true }
    ).populate('user_id', 'username email');

    const docObj = updatedDoctor.toObject();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor: { 
        ...docObj, 
        id: docObj._id,
        name: docObj.user_id?.username || docObj.name || '',
        email: docObj.user_id?.email || docObj.email || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. ပုံမှန် ဆရာဝန် အချက်အလက် ပြင်ဆင်ခြင်း
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, available_days, available_time } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { specialization, available_days, available_time },
      { returnDocument: 'after' }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const docObj = updatedDoctor.toObject();
    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: { ...docObj, id: docObj._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. ဆရာဝန် စာရင်း ဖျက်ထုတ်ခြင်း
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.user_id) {
      await User.findByIdAndDelete(doctor.user_id);
    }

    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. ဆရာဝန် Dashboard အတွက် Data များကို စုစည်းပေးခြင်း
exports.getDoctorDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    let doctor = await Doctor.findOne({ user_id: userId }).populate('user_id', 'username email');
    if (!doctor) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      doctor = new Doctor({ user_id: user._id, name: user.username, email: user.email, is_profile_completed: false });
      await doctor.save();
      doctor = await Doctor.findById(doctor._id).populate('user_id', 'username email');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let filter = {
      doctor_id: doctor._id,
      appointment_date: { $gte: todayStart, $lte: todayEnd }
    };

    let appointments = await Appointment.find(filter)
      .populate('patient_id', 'name phone')
      .lean();

    const formattedAppointments = appointments.map(app => ({
      ...app,
      id: app._id,
      name: app.patient_id?.name || 'Unknown'
    }));

    const requests = await Appointment.find({
      doctor_id: doctor._id,
      status: 'pending'
    }).populate('patient_id', 'name phone').sort({ createdAt: -1 }).lean();

    const formattedRequests = requests.map(reqItem => ({
      ...reqItem,
      id: reqItem._id,
      name: reqItem.patient_id?.name || 'Unknown'
    }));

    const totalPatientsCount = await Appointment.distinct('patient_id', { doctor_id: doctor._id });

    const docObj = doctor.toObject();

    res.status(200).json({
      success: true,
      data: {
        doctor: { 
          ...docObj, 
          id: docObj._id,
          name: docObj.user_id?.username || docObj.name || '',
          email: docObj.user_id?.email || docObj.email || ''
        },
        stats: {
          totalPatients: totalPatientsCount.length,
          todayPatients: formattedAppointments.length,
          todayAppointments: formattedAppointments.length
        },
        todayAppointments: formattedAppointments,
        nextPatient: formattedAppointments[0] || null,
        appointmentRequests: formattedRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 9. ရက်ချိန်းတောင်းဆိုမှုများ ရယူခြင်း
exports.getAppointmentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await Doctor.findOne({ user_id: userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const requests = await Appointment.find({
      doctor_id: doctor._id,
      status: 'pending'
    }).populate('patient_id', 'name phone').sort({ createdAt: -1 }).lean();

    const formatted = requests.map(item => ({
      ...item,
      id: item._id,
      name: item.patient_id?.name || 'Unknown'
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: error.message });
  }
};

// 10. ရက်ချိန်း Status ပြောင်းလဲခြင်း
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const obj = updated.toObject();
    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: { ...obj, id: obj._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};