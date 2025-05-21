const Inquiry = require("../models/Inquiry");
const { sendInquiryNotification } = require('../utils/emailService');

// Create new inquiry
exports.createInquiry = async (req, res) => {
  try {
    const {
      approximateBudget,
      visitOrCall,
      planToStart,
      name,
      email,
      phone,
      postcode,
      date,
      time,address,
      message,
      estimations,
      additionalDocument
    } = req.body;
console.log( approximateBudget,
  visitOrCall,
  planToStart,
  name,
  email,
  phone,
  postcode,
  date,
  time,address,
  message,
  additionalDocument);

    if (
      !name ||
      !email ||
      !phone ||
      !address 
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const inquiry = new Inquiry({
      approximateBudget,
      visitOrCall,
      planToStart,
      name,
      email,
      phone,
      postcode,
      date,
      time,address,
      message,
      estimations,
      additionalDocument
    });

    await inquiry.save();

    // Send email notification
    await sendInquiryNotification(inquiry);

    res.status(201).json({ message: 'Inquiry submitted', data: inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
