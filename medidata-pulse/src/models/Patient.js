const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  address: { type: String },
  blood: { type: String },    // 👈 bloodType အစား blood သို့ ပြောင်းထားပါသည်
  height: { type: String },   // 👈 အရပ် (Height) အချက်အလက်အတွက် ထည့်သွင်းထားသည်
  weight: { type: String },   // 👈 ကိုယ်အလေးချိန် (Weight) အချက်အလက်အတွက် ထည့်သွင်းထားသည်
  condition: { type: String },
  allergies: [{ type: String }],
  medicalHistory: { type: String },
  chronicConditions: { type: String },
  currentMedications: [{ type: String }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);