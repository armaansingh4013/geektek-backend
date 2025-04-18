const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    approximateBudget: {
      type: String,
      required: true,
    },
    planningPermission: {
      type: Boolean,
      required: true,
    },
    visitOrCall: {
      type: String,
      enum: ['visit', 'call'],
      required: true,
    },
    planToStart: {
      type: String, // or Date if preferred
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    postcode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
