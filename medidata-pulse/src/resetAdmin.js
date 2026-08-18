const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./config/db');
const bcrypt = require('bcrypt');

const resetAdminPassword = async () => {
  try {
    const newPassword = 'adminpassword123'; // လိုချင်သည့် Password အသစ်ကို ဤနေရာတွင် ထည့်ပါ
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `UPDATE users SET password = $1 WHERE email = 'admin@gmail.com'`;
    await db.query(query, [hashedPassword]);
    
    console.log('✅ Admin Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။ Password အသစ်မှာ:', newPassword);
  } catch (error) {
    console.error('Error resetting password:', error.message);
  } finally {
    process.exit();
  }
};

resetAdminPassword();