const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');

exports.addDoctorByAdmin = async (req, res) => {
  try {
    const { name, email, password, qualification, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered!' });
    }

    // 1. Password ကို Hash လုပ်ခြင်း[cite: 1]
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. User အဖြစ် သိမ်းဆည်းခြင်း[cite: 1]
    const newUser = new User({
      username: name,
      email,
      password: hashedPassword,
      role: 'doctor'
    });
    await newUser.save();

    // 3. Doctor Profile အဖြစ် သိမ်းဆည်းခြင်း[cite: 1]
    const newDoctor = new Doctor({
      user_id: newUser._id,
      name,
      email,
      qualification,
      phone,
      is_profile_completed: true
    });
    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully by admin',
      data: newDoctor
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};