const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  timeZone: {
    type: String,
    default: "Asia/Kolkata"
  },
  description: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure only one default shift
shiftSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['shift', 'notification', 'system'],
    unique: true
  },
  shifts: [shiftSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema); 