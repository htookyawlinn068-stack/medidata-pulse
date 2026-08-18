const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  duty_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  status: { type: String, default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);