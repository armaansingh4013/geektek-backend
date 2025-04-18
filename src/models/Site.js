const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  radius: {
    type: Number, // in meters
    required: true,
    default: 100 // default 100 meters radius
  },
  holidays: {
    type: Map,
    of: {
      description: String,
      isActive: {
        type: Boolean,
        default: true
      }
    },
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
siteSchema.index({ location: '2dsphere' });

// Method to check if a date is a holiday
siteSchema.methods.isHoliday = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const dateKey = startOfDay.toISOString().split('T')[0];
  
  const holiday = this.holidays.get(dateKey);
  return holiday && holiday.isActive;
};

// Method to get holiday description
siteSchema.methods.getHolidayDescription = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const dateKey = startOfDay.toISOString().split('T')[0];
  
  const holiday = this.holidays.get(dateKey);
  return holiday ? holiday.description : null;
};

module.exports = mongoose.model('Site', siteSchema); 