const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// 1. Admin Dashboard Stats (Overview အတွက်)
router.get('/dashboard', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalReceptionists = await User.countDocuments({ role: 'receptionist' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalReceptionists
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get All Users (User Management အတွက်)
router.get('/users', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Add Staff / User (Admin, Doctor, etc.)
router.post('/users', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;
    const userNameToSave = name || username;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: userNameToSave,
      email,
      password: hashedPassword,
      role: role || 'doctor'
    });

    await newUser.save();
    res.json({ success: true, message: 'User created successfully', data: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Add Doctor Account
router.post('/doctors', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = new User({
      username: name,
      email,
      password: hashedPassword,
      role: 'doctor'
    });

    await newDoctor.save();
    res.status(201).json({ success: true, message: 'Doctor account created successfully', data: newDoctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Add Receptionist Account (အသစ်ထည့်သွင်းခြင်း)
router.post('/receptionists', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newReceptionist = new User({
      username: name,
      email,
      password: hashedPassword,
      role: 'receptionist'
    });

    await newReceptionist.save();
    res.status(201).json({ success: true, message: 'Receptionist account created successfully', data: newReceptionist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Delete User (User ဖျက်ရန်)
router.delete('/users/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Get All Appointments (Admin Appointment Management အတွက်)
router.get('/appointments', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'username email')
      .populate('doctor', 'username email');
    
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;