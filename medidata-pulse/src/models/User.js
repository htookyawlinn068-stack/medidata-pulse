const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'user', 'receptionists'], default: 'patient' },
  
  // 🌟 အသစ်ထည့်သွင်းလိုက်သော အချက်အလက်များ (Patient Profile & Health info)
  allergies: { type: String, default: '' }, // မတည့်သော ဆေးဝါး/အစားအစာများ
  isProfileComplete: { type: Boolean, default: false } // ပထမဆုံး Login တွင် Profile ဖြည့်ပြီး/မပြီး စစ်ဆေးရန်
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);