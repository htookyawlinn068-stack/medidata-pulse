const HealthRecord = require('../models/HealthRecord');
const Patient = require('../models/Patient');

// လူနာ၏ ကျန်းမာရေး မှတ်တမ်းအားလုံးကို ရယူရန်
exports.getHealthRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user_id: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const records = await HealthRecord.find({ patient_id: patient._id })
      .populate('doctor_id', 'username name specialization')
      .sort({ record_date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};