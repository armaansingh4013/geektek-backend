const Inquiry = require("../models/Inquiry");
const { sendInquiryNotification } = require('../utils/emailService');
const { notifyAdmins } = require('../utils/notificationService');

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
      time,
      address,
      message,
      estimations,
      additionalDocument
    } = req.body;


    if (
      !name ||
      !email ||
      !phone 
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
      time,
      address,
      message,
      estimations,
      additionalDocument
    });

    await inquiry.save();

    // Send email notification
    await sendInquiryNotification(inquiry);

    // Send push notification to all admin users
    await notifyAdmins(
      'New Inquiry Received',
      `${name} submitted a new inquiry for ${visitOrCall || 'service'}`
    );

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


//Update inquiry status
exports.updateInquiry = async (req, res) => {
  try {
    const inquiryId = req.params.id;
    const {  status } = req.body;

    if (!inquiryId || !status) {
      return res.status(400).json({ error: 'Inquiry ID and status are required' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(inquiryId, {status}, { new: true });    

    res.status(200).json({ message: 'Inquiry updated', data: inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
