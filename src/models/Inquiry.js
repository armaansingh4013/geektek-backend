const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    approximateBudget: {
      type: String,
      required: true,
    },
    planningPermission: {
      type: Boolean,
    },
    visitOrCall: {
      type: String,
      required: true,
    },
    planToStart: {
      type: String, 
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
    date:{
      type:String
    },
    time:{
      type:String
    },
    address:{
      type:String
    },
    message:{
      type:String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
