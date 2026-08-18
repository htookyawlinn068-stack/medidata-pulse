const Consultation = require('../models/Consultation');

// @desc    Get all consultations (Role အလိုက် Patient သို့မဟုတ် Doctor စစ်ထုတ်နိုင်သည်)
// @route   GET /api/consultations
// @access  Private
exports.getConsultations = async (req, res) => {
  try {
    let query = {};

    // အကယ်၍ Login ဝင်ထားသူက Patient ဖြစ်ပါက သူ့ရဲ့ ID နဲ့ဆိုင်တာပဲ ပြမယ်
    if (req.user.role === 'patient') {
      query.patient = req.user.patientId; // သင့်ရဲ့ Auth Middleware ပေါ်မူတည်၍ ပြင်ရန်
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const consultations = await Consultation.find(query)
      .populate('patient', 'name age gender')
      .populate('doctor', 'username specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: 'ဆာဗာအတွင်း အမှားအယွင်း ဖြစ်ပွား住了 (Server Error)'
    });
  }
};

// @desc    Create new consultation record
// @route   POST /api/consultations
// @access  Private (Doctor only)
exports.createConsultation = async (req, res) => {
  try {
    const { patientId, diagnosis, notes, status, date } = req.body;

    const consultation = await Consultation.create({
      patient: patientId,
      doctor: req.user.id,
      diagnosis,
      notes,
      status: status || 'Completed',
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'ဆွေးနွေးမှု မှတ်တမ်း အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။',
      data: consultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'မှတ်တမ်း သိမ်းဆည်း၍ မရပါ။'
    });
  }
};