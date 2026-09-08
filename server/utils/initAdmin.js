const User = require('../models/User');

const ADMIN_EMAIL = 'kailas87095@gmail.com';
const ADMIN_PASS = 'Admin@123';

async function initAdminUser() {
  try {
    // Demote any other accounts that were assigned admin role
    await User.updateMany(
      { email: { $ne: ADMIN_EMAIL }, role: 'admin' },
      { $set: { role: 'citizen' } }
    );

    // Ensure the exclusive admin account exists with proper role & password
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: ADMIN_EMAIL,
        passwordHash: ADMIN_PASS,
        role: 'admin',
        phone: '9876543212',
        location: 'Central Command',
        badge: 'System Admin',
      });
      await admin.save();
      console.log(`👑 Exclusive Admin account created for ${ADMIN_EMAIL}`);
    } else {
      admin.role = 'admin';
      admin.passwordHash = ADMIN_PASS;
      await admin.save();
      console.log(`👑 Exclusive Admin account updated & verified for ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('⚠️ Admin initialization error:', err.message);
  }
}

module.exports = initAdminUser;
