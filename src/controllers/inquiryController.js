const Inquiry = require("../models/Inquiry");

// Create new inquiry
exports.createInquiry = async (req, res) => {
  try {
    const {
      approximateBudget,
      planningPermission,
      visitOrCall,
      planToStart,
      name,
      email,
      phone,
      postcode,
    } = req.body;

    if (
      !approximateBudget ||
      planningPermission === undefined ||
      !visitOrCall ||
      !planToStart ||
      !name ||
      !email ||
      !phone ||
      !postcode
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const inquiry = new Inquiry({
      approximateBudget,
      planningPermission,
      visitOrCall,
      planToStart,
      name,
      email,
      phone,
      postcode,
    });

    await inquiry.save();
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
