const express = require('express');
const { 
  storePushToken, 
  sendNotificationToUser,
  getUserDevices,
  deactivateDevice
} = require('./controller');

const router = express.Router();

// Token management
router.post('/save-token', storePushToken);

// Notification sending
router.post('/send', sendNotificationToUser);

// Device management
router.get('/devices/:userId', getUserDevices);
router.delete('/devices/:deviceId', deactivateDevice);

module.exports = router;
