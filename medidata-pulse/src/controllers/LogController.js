const AuditLog = require('../models/AuditLog');

// MongoDB ထဲမှ Logs များအားလုံးကို တောင်းယူခြင်း[cite: 6]
exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();
    const formatted = logs.map(l => ({ ...l, id: l._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};