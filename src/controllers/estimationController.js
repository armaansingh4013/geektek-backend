const Estimation = require('../models/Estimation');
const { sendEstimationNotification } = require('../utils/emailService');
const { notifyAdmins } = require('../utils/notificationService');

// Create new estimation
exports.createEstimation = async (req, res) => {
  try {
    const estimation = new Estimation(req.body);
    await estimation.save();

    // Send notification email
    await sendEstimationNotification(estimation);

    // Send push notification to all admin users
    await notifyAdmins(
      'New Estimation Request',
      `${estimation.name} submitted a new estimation request`
    );

    res.status(201).json({
      message: 'Estimation created successfully',
      estimation
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating estimation',
      error: error.message
    });
  }
};

// Get all estimations
exports.getAllEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.find().sort({ createdAt: -1 });
    res.json(estimations);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching estimations',
      error: error.message
    });
  }
};

// Get single estimation by ID
exports.getEstimationById = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id);
    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }
    res.json(estimation);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching estimation',
      error: error.message
    });
  }
};

// Update estimation
exports.updateEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }
    res.json({
      message: 'Estimation updated successfully',
      estimation
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating estimation',
      error: error.message
    });
  }
};

// Delete estimation
exports.deleteEstimation = async (req, res) => {
  try {
    const estimation = await Estimation.findByIdAndDelete(req.params.id);
    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }
    res.json({ message: 'Estimation deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting estimation',
      error: error.message
    });
  }
};