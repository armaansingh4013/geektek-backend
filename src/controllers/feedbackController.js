const Feedback = require("../models/Feedback");


// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, message ,images,videos} = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const feedback = new Feedback({ name, email, message,images,videos });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted', data: feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
