const Settings = require('../models/Settings');
const User = require('../models/User');

// Initialize settings if not exists
const initializeSettings = async () => {
  try {
    let shiftSettings = await Settings.findOne({ type: 'shift' });
    
    if (!shiftSettings) {
      shiftSettings = new Settings({
        type: 'shift',
        shifts: [{
          name: 'Regular Shift',
          startTime: '09:00',
          endTime: '17:00',
          timeZone: 'Asia/Kolkata',
          description: 'Default 9 AM to 5 PM shift',
          isDefault: true,
          isActive: true
        }]
      });
      await shiftSettings.save();
    }
    return shiftSettings;
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const settings = await initializeSettings();
    res.json(settings.shifts);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching shifts',
      error: error.message
    });
  }
};

// Add new shift
exports.addShift = async (req, res) => {
  try {
    const { name, startTime, endTime, timeZone, description, isDefault } = req.body;

    let settings = await Settings.findOne({ type: 'shift' });
    if (!settings) {
      settings = await initializeSettings();
    }

    settings.shifts.push({
      name,
      startTime,
      endTime,
      timeZone,
      description,
      isDefault
    });

    await settings.save();

    res.status(201).json({
      message: 'Shift added successfully',
      shift: settings.shifts[settings.shifts.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding shift',
      error: error.message
    });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const updates = req.body;

    const settings = await Settings.findOne({ type: 'shift' });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const shiftIndex = settings.shifts.findIndex(
      shift => shift._id.toString() === shiftId
    );

    if (shiftIndex === -1) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    Object.assign(settings.shifts[shiftIndex], updates);
    await settings.save();

    res.json({
      message: 'Shift updated successfully',
      shift: settings.shifts[shiftIndex]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating shift',
      error: error.message
    });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const settings = await Settings.findOne({ type: 'shift' });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    // Check if shift is assigned to any users
    const usersWithShift = await User.countDocuments({ shiftId });

    if (usersWithShift > 0) {
      return res.status(400).json({
        message: 'Cannot delete shift as it is assigned to users'
      });
    }

    const shiftIndex = settings.shifts.findIndex(
      shift => shift._id.toString() === shiftId
    );

    if (shiftIndex === -1) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (settings.shifts[shiftIndex].isDefault) {
      return res.status(400).json({
        message: 'Cannot delete default shift'
      });
    }

    settings.shifts.splice(shiftIndex, 1);
    await settings.save();

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting shift',
      error: error.message
    });
  }
};

// Assign shift to user
exports.assignShiftToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shiftId } = req.body;

    const settings = await Settings.findOne({ type: 'shift' });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const shift = settings.shifts.id(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (!shift.isActive) {
      return res.status(400).json({ message: 'Shift is not active' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { shiftId: shift._id },
      { new: true }
    ).select('-password')
    .populate({
      path: 'shiftId',
      select: 'name startTime endTime timeZone'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Shift assigned successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error assigning shift',
      error: error.message
    });
  }
};

// Get user's shift details
exports.getUserShift = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name employeeCode shiftId')
      .populate({
        path: 'shiftId',
        select: 'name startTime endTime timeZone description'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.shiftId) {
      // If no shift assigned, get default shift
      const settings = await Settings.findOne({ type: 'shift' });
      const defaultShift = settings.shifts.find(shift => shift.isDefault);
      
      res.json({
        user: user.name,
        employeeCode: user.employeeCode,
        shift: defaultShift || null,
        isDefault: true
      });
    } else {
      res.json({
        user: user.name,
        employeeCode: user.employeeCode,
        shift: user.shiftId,
        isDefault: false
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user shift',
      error: error.message
    });
  }
}; 