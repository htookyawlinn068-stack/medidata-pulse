const db = require('./config/db'); // သင့်ရဲ့ database connection လမ်းကြောင်း

const checkAdmin = async () => {
  try {
    const result = await db.query("SELECT id, email, role FROM users WHERE role = 'admin'");
    
    if (result.rows.length > 0) {
      console.log('✅ Admin အကောင့်များ တွေ့ရှိပါသည်:', result.rows);
    } else {
      console.log('❌ Database ထဲတွင် Admin အကောင့် လုံးဝ မရှိသေးပါ။');
    }
  } catch (error) {
    console.error('Error querying database:', error.message);
  } finally {
    process.exit();
  }
};

checkAdmin();