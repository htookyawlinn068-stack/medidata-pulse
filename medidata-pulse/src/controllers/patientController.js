const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const HealthRecord = require('../models/HealthRecord');
const redisClient = require('../config/redis');

// 1. Patient Dashboard အချက်အလက်များ၊ ဆရာဝန်စာရင်းနှင့် Health Records များ ရယူခြင်း
exports.getPatientDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user_id: req.user.id }).lean();
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patient_id: patient._id })
      .populate('doctor_id', 'username specialization name')
      .sort({ appointment_date: -1 })
      .lean();

    const formattedAppointments = appointments.map(app => ({
      id: app._id,
      title: app.notes || 'General Checkup',
      doctor: app.doctor_id?.username || app.doctor_id?.name || 'Dr. Specialist',
      date: `${new Date(app.appointment_date).toLocaleDateString()} • ${app.appointment_time}`,
      status: app.status
    }));

    // ဆရာဝန်စာရင်းနှင့် ကျန်းမာရေးမှတ်တမ်းများကိုပါ တစ်ပါတည်း ဆွဲထုတ်ခြင်း
    const doctors = await Doctor.find().lean();
    const healthRecords = await HealthRecord.find({ patient_id: patient._id }).sort({ record_date: -1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: patient._id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
          blood: patient.blood,
          height: patient.height,
          weight: patient.weight,
          allergies: patient.allergies || []
        },
        totalConsultations: appointments.length,
        availablePrescriptions: healthRecords.reduce((acc, curr) => acc + (curr.prescription?.length || 0), 0),
        upcomingAppointments: formattedAppointments,
        doctors: doctors,
        healthRecords: healthRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Patients (Redis Caching ဖြင့်)
exports.getAllPatients = async (req, res) => {
  try {
    const cacheKey = 'all_patients';
    
    if (redisClient && typeof redisClient.get === 'function') {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: JSON.parse(cachedData)
        });
      }
    }

    const patients = await Patient.find().sort({ _id: -1 }).lean();
    const formatted = patients.map(p => ({ ...p, id: p._id }));
    
    if (redisClient && typeof redisClient.setEx === 'function') {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(formatted));
    }

    res.status(200).json({
      success: true,
      source: 'database',
      data: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Single Patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `patient_${id}`;

    if (redisClient && typeof redisClient.get === 'function') {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, source: 'cache', data: JSON.parse(cachedData) });
      }
    }

    const patient = await Patient.findById(id).lean();
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const formatted = { ...patient, id: patient._id };

    if (redisClient && typeof redisClient.setEx === 'function') {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(formatted));
    }

    res.status(200).json({ success: true, source: 'database', data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Create New Patient Profile
exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, address, blood, height, weight, allergies } = req.body;

    const updatedPatient = await Patient.findOneAndUpdate(
      { user_id: req.user.id },
      { 
        name, 
        age, 
        gender, 
        phone, 
        address, 
        blood, 
        height, 
        weight,
        allergies: allergies || [] 
      },
      { new: true, upsert: true }
    );
    
    if (redisClient && typeof redisClient.del === 'function') {
      await redisClient.del('all_patients');
    }

    const obj = updatedPatient.toObject();
    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: { ...obj, id: obj._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, address, blood, height, weight, allergies } = req.body;

    const updated = await Patient.findByIdAndUpdate(
      id,
      { name, age, gender, phone, address, blood, height, weight, allergies },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (redisClient && typeof redisClient.del === 'function') {
      await redisClient.del('all_patients');
      await redisClient.del(`patient_${id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: { ...updated, id: updated._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Patient.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (redisClient && typeof redisClient.del === 'function') {
      await redisClient.del('all_patients');
      await redisClient.del(`patient_${id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};