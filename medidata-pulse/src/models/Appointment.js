const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  doctor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  appointment_date: { 
    type: Date, 
    required: true 
  },
  appointment_time: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'missed', 'cancelled', 'pending', 'accepted', 'rejected'], 
    default: 'pending' // 🌟 လူနာတင်လိုက်သည်နှင့် pending အနေအထားဖြင့် စတင်မည်
  },
  notes: { 
    type: String, 
    default: '' // လူနာထည့်မည့် ရောဂါလက္ခဏာ သို့မဟုတ် မှတ်စု
  },
  rejection_reason: { 
    type: String, 
    default: '' // 🌟 ဆရာဝန်မှ ငြင်းပယ်ပါက အကြောင်းပြချက် သိမ်းရန်
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);