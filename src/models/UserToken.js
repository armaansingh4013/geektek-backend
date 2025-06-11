const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expoPushToken: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: String,
    default: ''
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for deviceId and userId to ensure one token per device per user
userTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken; 