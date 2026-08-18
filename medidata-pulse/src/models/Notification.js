const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'recipient_model' // လူနာ သို့မဟုတ် ဆရာဝန် ဖြစ်နိုင်သည်
  },
  recipient_model: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor']
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  is_read: { 
    type: Boolean, 
    default: false 
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);