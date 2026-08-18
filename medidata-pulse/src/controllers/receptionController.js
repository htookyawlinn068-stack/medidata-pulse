const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

exports.getReceptionDashboard = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ _id: -1 }).limit(10).lean();
    const formattedPatients = patients.map(p => ({ ...p, id: p._id }));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      appointment_date: { $gte: todayStart, $lte: todayEnd }
    }).sort({ _id: -1 }).lean();

    const formattedAppointments = appointments.map(a => ({ ...a, id: a._id }));

    res.status(200).json({
      success: true,
      data: {
        recentPatients: formattedPatients,
        todayAppointments: formattedAppointments,
        totalRegisteredToday: formattedPatients.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};