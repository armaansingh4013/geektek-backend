const mongoose = require('mongoose');
const { create } = require('./User');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String
  },
  url: {
    type: String
  },
  facebook: {
    type: String
  },
  instagram: {
    type: String
  }, 
  linkedin: {
    type: String
  },
  youtube: {
    type: String
  },
   createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  users:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: [{
    sessionId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Website', websiteSchema); 