const Feedback = require("../models/Feedback");
const { sendFeedbackNotification } = require('../utils/emailService');
const cloudinary = require('../utils/cloudinary');

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, message, rating, images, videos } = req.body;

    if (!name || !email || !message || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, message, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const feedback = new Feedback({
      name,
      email,
      message,
      rating,
      images: images || [],
      videos: videos || []
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
    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: err.message
    });
  }
};


// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Delete images from cloudinary
    if (feedback.images.length > 0) {
      for (const image of feedback.images) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.error(`Failed to delete image ${image.public_id}:`, err);
        }
      }
    }

    // Delete videos from cloudinary
    if (feedback.videos.length > 0) {
      for (const video of feedback.videos) {
        try {
          await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' });
        } catch (err) {
          console.error(`Failed to delete video ${video.public_id}:`, err);
        }
      }
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: err.message
    });
  }
};
