const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Site = require('../models/Site');
const Holiday = require('../models/Holiday');

// Mark attendance (check-in)
exports.markCheckIn = async (req, res) => {
  try {
    const { userId, location, photo, siteId } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if site exists and is active
    // const site = await Site.findById(siteId);
    // if (!site) {
    //   return res.status(404).json({ message: 'Site not found' });
    // }
    // if (!site.isActive) {
    //   return res.status(400).json({ message: 'Site is not active' });
    // }

    // Check if user is within site radius
    // const distance = calculateDistance(
    //   location[0], location[1],
    //   site.location.coordinates[0], site.location.coordinates[1]
    // );

    // if (distance > site.radius) {
    //   return res.status(400).json({ message: 'You are not within the site premises' });
    // }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      userId,
      'checkIn.time': {
        $gte: today
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    // Check if it's a holiday
    // const isHoliday = site.isHoliday(new Date());
    const isHoliday = false
    // Determine if location is a string (address) or array (coordinates)
    let checkInLocation = undefined;
    let checkInAddress = undefined;
    if (typeof location === 'string') {
      checkInAddress = location;
    } else if (Array.isArray(location)) {
      checkInLocation = {
        type: 'Point',
        coordinates: location
      };
    }
    const attendance = new Attendance({
      userId,
      date: new Date(),
      checkIn: {
        time: new Date(),
        ...(checkInLocation ? { location: checkInLocation } : {}),
        ...(checkInAddress ? { address: checkInAddress } : {}),
        photo: photo
      },
      isHoliday,
      siteId,
      status: isHoliday ? 'holiday' : 'present'
    });

    await attendance.save();

    res.status(201).json({
      message: isHoliday ? 'Holiday check-in recorded' : 'Check-in successful',
      attendance
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance (check-out)
exports.markCheckOut = async (req, res) => {
  try {
    const { userId, location, photo, siteId } = req.body;

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOne({
      userId,
      'checkIn.time': {
        $gte: today
      }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut && attendance.checkOut.photo) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    // Check if user is within site radius
    // const site = await Site.findById(siteId);
    // const distance = calculateDistance(
    //   location[0], location[1],
    //   site.location.coordinates[0], site.location.coordinates[1]
    // );

    // if (distance > site.radius) {
    //   return res.status(400).json({ message: 'You are not within the site premises' });
    // }

    // For check-out
    let checkOutLocation = undefined;
    let checkOutAddress = undefined;
    if (typeof location === 'string') {
      checkOutAddress = location;
    } else if (Array.isArray(location)) {
      checkOutLocation = {
        type: 'Point',
        coordinates: location
      };
    }
    attendance.checkOut = {
      time: new Date(),
      ...(checkOutLocation ? { location: checkOutLocation } : {}),
      ...(checkOutAddress ? { address: checkOutAddress } : {}),
      photo: photo
    };

    // Calculate status based on check-in/out times
    // const checkInTime = new Date(attendance.shiftStart.time);
    // const checkOutTime = new Date(attendance.shiftEnd.time);
    
    // Example: Consider late if check-in is after 9 AM and early exit if check-out is before 5 PM
    // const isLate = checkInTime.getHours() > 9;
    // const isEarlyExit = checkOutTime.getHours() < 17;

    // if (!attendance.isHoliday) {
    //   if (isLate) {
    //     attendance.status = 'late';
    //   } else if (isEarlyExit) {
    //     attendance.status = 'early_exit';
    //   }
    // }

    await attendance.save();

    res.json({
      message: 'Check-out successful',
      attendance
    });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for a user
exports.getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, siteId } = req.query;

    const query = { userId };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (siteId) {
      query.siteId = siteId;
    }

    const attendance = await Attendance.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name employeeCode')
      .populate('siteId', 'name address');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for all users
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, siteId } = req.query;

    const query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (siteId) {
      query.siteId = siteId;
    }

    const attendance = await Attendance.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name employeeCode')
      .populate('siteId', 'name address');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check current attendance status
exports.checkCurrentStatus = async (req, res) => {
  try {
    const { userId, siteId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today is a holiday
    const holiday = await Holiday.findOne({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const isHoliday = !!holiday;

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId,
      "checkIn.time": { $gte: today },
    });
console.log('====================================');
console.log(attendance);
console.log('====================================');
    // If no attendance record found for today
    if (!attendance) {
      return res.json({
        status: "not_checked_in",
        message: isHoliday
          ? `Today is a holiday (${holiday.name})`
          : "User has not checked in today",
        canCheckIn: true,
        canCheckOut: false,
        isHoliday,
        holiday: isHoliday ? {
          name: holiday.name,
          description: holiday.description
        } : null
      });
    }

    // If user has checked in but not checked out
    if (attendance.checkIn && !attendance.checkOut?.time) {
      return res.json({
        status: "checked_in",
        message: isHoliday
          ? `User is checked in on holiday (${holiday.name})`
          : "User is currently checked in",
        canCheckIn: false,
        canCheckOut: true,
        siteId:attendance.siteId,
        checkInTime: attendance.checkIn.time,
        checkInLocation: attendance.checkIn.location,
        checkIn: attendance.checkIn,
        isHoliday,
        holiday: isHoliday ? {
          name: holiday.name,
          description: holiday.description
        } : null
      });
    }

    // If both checked in and checked out
    return res.json({
      status: "checked_out",
      message: isHoliday
        ? `You have completed holiday attendance (${holiday.name})`
        : "You have completed attendance for today",
      canCheckIn: false,
      canCheckOut: false,
      checkInTime: attendance.checkIn.time,
      checkOutTime: attendance.checkOut.time,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      isHoliday,
      holiday: isHoliday ? {
        name: holiday.name,
        description: holiday.description
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add work images to today's attendance
exports.addWorkImages = async (req, res) => {
  try {
    const { message, images } = req.body;

    if (!message || !images || !images.length) {
      return res.status(400).json({
        message: 'Both message and image paths are required'
      });
    }

    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!attendance) {
      return res.status(404).json({
        message: 'No attendance record found for today'
      });
    }

    // Add work images
    attendance.workImages.push({
      images: images,
      message
    });

    await attendance.save();

    res.status(200).json({
      message: 'Work images added successfully',
      workImages: attendance.workImages
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding work images',
      error: error.message
    });
  }
};

// Get work images for a specific date
exports.getWorkImages = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: date,
        $lt: nextDay
      }
    });

    if (!attendance) {
      return res.status(404).json({
        message: 'No attendance record found for the specified date'
      });
    }

    res.status(200).json({
      workImages: attendance.workImages
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving work images',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
} 