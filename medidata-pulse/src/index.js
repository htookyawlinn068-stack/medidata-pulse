const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // MongoDB Connection
require('dotenv').config();

// Routes များ Import လုပ်ခြင်း
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const logRoutes = require('./routes/LogRoutes');
const receptionRoutes = require('./routes/receptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorScheduleRoutes = require('./routes/doctorScheduleRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB သို့ ချိတ်ဆက်ခြင်း
connectDB();

// CORS Configuration - PATCH ကိုပါ ထည့်သွင်းပေးလိုက်ပါပြီ
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // <--- PATCH ထည့်ထားသည်
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root Route
app.get('/', (req, res) => {
  res.send('MediData-Pulse API is running...');
});

// API Routes များ
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor-schedules', doctorScheduleRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});