const User = require('../models/User');
const { sendDirectNotification } = require('../notifications/controller');

// Send notification to all admin users
const notifyAdmins = async (title, body) => {
  try {
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    // Send notification to each admin
    const notifications = adminUsers.map(admin => 
      sendDirectNotification({
        userId: admin._id.toString(),
        title,
        body
      })
    );

    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
};

module.exports = {
  notifyAdmins
}; 