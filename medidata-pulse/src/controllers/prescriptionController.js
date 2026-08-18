const Prescription = require('../models/Prescription');

// @desc    Get all prescriptions (Role အလိုက် Patient သို့မဟုတ် Doctor စစ်ထုတ်ပေးသည်)
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patientDoc = await require('../models/Patient').findOne({
        $or: [{ _id: req.user.id }, { user_id: req.user.id }]
      });
      if (patientDoc) {
        query.patient = patientDoc._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age gender phone')
      .populate('doctor', 'name username qualification specialization')
      .populate('consultation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'ဆေးညွှန်းအချက်အလက်များကို ရယူရာတွင် အမှားအယွင်းရှိနေပါသည်။'
    });
  }
};

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, consultationId, medicines, description } = req.body;

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.id,
      consultation: consultationId || null,
      medicines,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'ဆေးညွှန်းအသစ်ကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။',
      data: prescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'ဆေးညွှန်း သိမ်းဆည်း၍ မရပါ။'
    });
  }
};