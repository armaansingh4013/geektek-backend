const mongoose = require('mongoose');
const { array } = require('../utils/fileUpload');

const inquirySchema = new mongoose.Schema(
  {
    approximateBudget: {
      type: String,
    },
    planningPermission: {
      type: Boolean,
    },
    visitOrCall: {
      type: String,
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
    },
    status:{
      type:String,
      default:"New"
    },
    additionalDocument: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);