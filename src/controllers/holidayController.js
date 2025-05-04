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
      .sort({ date: 1 })
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