const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. User Register (Public မှ Sign-Up လုပ်သူအားလုံးသည် Patient သာ ဖြစ်စေရမည်)
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = 'patient';

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: userRole
    });
    await newUser.save();

    // Register လုပ်တာနဲ့ Patient Document ကိုပါ တစ်ခါတည်း အလိုအလျောက် ဆောက်ပေးမည်
    await Patient.findOneAndUpdate(
      { user_id: newUser._id },
      { user_id: newUser._id, name: username, email },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. User Login (ဝင်ရောက်ခြင်း)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    let profileStatus = true; // Default အနေဖြင့် ပြီးပြီဟု ယူဆမည်

    // 💡 Patient ဖြစ်ပါက Profile အချက်အလက်များ (ဥပမာ - age, blood စသည်) အပြည့်အစုံ ရှိမရှိ စစ်ဆေးမည်
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user_id: user._id });
      // အကယ်၍ Patient doc မရှိတော့ခြင်း (သို့) အဓိက field တစ်ခုခု (ဥပမာ age သို့မဟုတ် blood) လပ်နေပါက false ပေးမည်
      if (!patient || !patient.age || !patient.blood) {
        profileStatus = false;
      }
    } 
    // Doctor ဖြစ်ပါက Doctor Model ထဲမှ is_profile_completed ကို စစ်ဆေးမည်
    else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: user._id });
      if (doctor) {
        profileStatus = doctor.is_profile_completed;
      } else {
        profileStatus = false;
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_profile_completed: profileStatus 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. လူနာ Profile အချက်အလက်များ (ဆေးမတည့်မှု၊ အသက်၊ သွေး စသည်) အသစ်ထည့်ရန်/ပြင်ရန်
exports.updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id; // verifyToken middleware မှ ဝင်လာသော User ID
    const { name, age, gender, phone, address, blood, height, weight, allergies, medicalHistory } = req.body;

    const updatedPatient = await Patient.findOneAndUpdate(
      { user_id: userId },
      { 
        name, 
        age, 
        gender, 
        phone, 
        address, 
        blood, 
        height, 
        weight, 
        allergies, 
        medicalHistory 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};