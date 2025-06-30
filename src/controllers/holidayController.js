const Holiday = require('../models/Holiday');

exports.createHoliday = async (req, res) => {
  try {
    const { name, date, description } = req.body;
    
    const holiday = new Holiday({
      name,
      date,
      description,
      createdBy: req.user._id
    });

    await holiday.save();
    
    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating holiday',
      error: error.message
    });
  }
};

exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: holidays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching holidays',
      error: error.message
    });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description } = req.body;

    const holiday = await Holiday.findById(id);
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    // Update the holiday fields
    holiday.name = name || holiday.name;
    holiday.date = date || holiday.date;
    holiday.description = description || holiday.description;

    await holiday.save();

    res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating holiday',
      error: error.message
    });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    await Holiday.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting holiday',
      error: error.message
    });
  }
}; 