const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  specialization: { type: String },
  qualification: { type: String },
  phone: { type: String },
  available_days: [{ type: String }],
  available_time: { type: String },
  is_profile_completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);