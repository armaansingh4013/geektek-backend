const sendPushNotification = require('./sendPush');
const UserToken = require('../models/UserToken');

const storePushToken = async (req, res) => {
  try {
    const { userId, expoPushToken, deviceInfo, deviceId, deviceType } = req.body;

    if (!expoPushToken || !userId || !deviceId || !deviceType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'expoPushToken', 'deviceId', 'deviceType']
      });
    }

    // Update or create token for this specific device
    const token = await UserToken.findOneAndUpdate(
      { userId, deviceId },
      { 
        userId,
        expoPushToken,
        deviceInfo: deviceInfo || '',
        deviceId,
        deviceType,
        isActive: true,
        lastUsed: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'Token saved successfully', 
      token,
      deviceCount: await UserToken.countDocuments({ userId, isActive: true })
    });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
};

const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body, deviceIds } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build query to find active tokens
    const query = { userId, isActive: true };
    if (deviceIds && deviceIds.length > 0) {
      query.deviceId = { $in: deviceIds };
    }

    // Find all active tokens for the user
    const tokens = await UserToken.find(query);
    
    if (!tokens.length) {
      return res.status(404).json({ error: 'No active tokens found for user' });
    }

    // Send notification to all matching devices
    const notifications = tokens.map(token => 
      sendPushNotification(token.expoPushToken, title, body)
    );

    const results = await Promise.allSettled(notifications);
    
    // Count successful and failed notifications
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({ 
      message: 'Notifications processed',
      totalDevices: tokens.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

const getUserDevices = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const devices = await UserToken.find({ 
      userId, 
      isActive: true 
    }).select('-expoPushToken');

    res.json({ devices });
  } catch (error) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({ error: 'Failed to fetch user devices' });
  }
};

const deactivateDevice = async (req, res) => {
  try {
    const { userId, deviceId } = req.params;
    
    const device = await UserToken.findOneAndUpdate(
      { userId, deviceId },
      { isActive: false },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ 
      message: 'Device deactivated successfully',
      device
    });
  } catch (error) {
    console.error('Error deactivating device:', error);
    res.status(500).json({ error: 'Failed to deactivate device' });
  }
};

module.exports = { 
  storePushToken, 
  sendNotificationToUser,
  getUserDevices,
  deactivateDevice
};
