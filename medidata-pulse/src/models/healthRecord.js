const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // ကုသပေးသော ဆရာဝန် (Optional)
  diagnosis: { type: String, required: true }, // ရောဂါရှာဖွေတွေ့ရှိချက်
  symptoms: { type: String }, // ရောဂါလက္ခဏာများ
  prescription: [{ 
    medicine_name: String,
    dosage: String,
    duration: String
  }], // ပေးလိုက်သော ဆေးစာများ
  notes: { type: String }, // ဆရာဝန် သို့မဟုတ် လူနာ၏ မှတ်စုများ
  record_date: { type: Date, default: Date.now } // မှတ်တမ်းတင်သည့်ရက်စွဲ
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
