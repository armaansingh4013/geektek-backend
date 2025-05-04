const Feedback = require("../models/Feedback");
const { sendFeedbackNotification } = require('../utils/emailService');


// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, phone, type, message } = req.body;
    const photos = req.files ? req.files.map(file => file.path) : [];

    const feedback = new Feedback({
      name,
      email,
      phone,
      type,
      message,
      photos
    });

    await feedback.save();

    // Send email notification
    await sendFeedbackNotification(feedback);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
