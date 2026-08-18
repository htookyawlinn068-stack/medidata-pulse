const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 စက္ကန့်အတွင်း ချိတ်ဆက်မှု မရပါက အမြန်ဆုံး Error ပြရန်
    });
    console.log(`Connected to MongoDB successfully: ${conn.connection.host} 🍃`);
  } catch (err) {
    console.error('MongoDB Connection Error ❌:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;