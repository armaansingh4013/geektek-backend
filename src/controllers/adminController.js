const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Site = require('../models/Site');
const Holiday = require('../models/Holiday');
const bcrypt = require('bcryptjs');

exports.getDashboardData = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total enabled users with role 'user'
    const totalUsers = await User.countDocuments({
      role: 'user',
      isEnabled: true
    });

    // Get today's attendance data
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('userId', 'name profileImage')
      .populate('siteId', 'name');

    // Calculate present and absent users
    const presentUsers = todayAttendance.length;
    const absentUsers = totalUsers - presentUsers;

    // Group attendance by site
    const siteAttendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: '$siteId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get site details for the attendance
    const sites = await Site.find({
      _id: { $in: siteAttendance.map(sa => sa._id) }
    });

    // Combine site data with attendance count
    const siteWiseAttendance = sites.map(site => {
      const attendanceData = siteAttendance.find(sa => sa._id.toString() === site._id.toString());
      return {
        siteName: site.name,
        presentCount: attendanceData ? attendanceData.count : 0
      };
    });

    // Get today's work images with user and site details
    const workImagesData = todayAttendance
      .filter(att => att.workImages && att.workImages.length > 0)
      .map(att => att.workImages.map(wi => ({
        employeeName: att.userId.name,
        employeeImage: att.userId.profileImage,
        siteName: att.siteId.name,
        images: wi.images,
        message: wi.message,
        timestamp: wi.timestamp
      }))).flat();

    res.json({
      totalEnabledUsers: totalUsers,
      presentUsers,
      absentUsers,
      siteWiseAttendance,
      workImagesData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get attendance for a specific date
exports.getDateAttendance = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if the date is a holiday
    const holiday = await Holiday.findOne({
      date: {
        $gte: date,
        $lt: nextDay
      }
    });

    const attendance = await Attendance.find({
      date: {
        $gte: date,
        $lt: nextDay
      }
    }).populate('userId', 'name employeeCode profileImage')
      .populate('siteId', 'name')
      .sort('userId.name');

    const formattedAttendance = attendance.map(att => ({
      employeeName: att.userId.name,
      employeeCode: att.userId.employeeCode,
      profileImage: att.userId.profileImage,
      siteName: att.siteId.name,
      checkIn: att.checkIn?.time || null,
      checkOut: att.checkOut?.time || null,
      checkInData: att.checkIn || null,
      checkOutData: att.checkOut || null,
      status: att.status,
      workImages: att.workImages.map(wi => ({
        images: wi.images,
        message: wi.message,
        timestamp: wi.timestamp
      }))
    }));

    res.json({
      date: date,
      isHoliday: !!holiday,
      holiday: holiday ? {
        name: holiday.name,
        description: holiday.description
      } : null,
      attendance: formattedAttendance
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching date attendance',
      error: error.message
    });
  }
};

// Get employee attendance report
exports.getEmployeeReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  console.log('====================================');
  console.log( start, end);
  console.log('====================================');
  
    // Validate employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get all attendance records in date range
    const attendanceRecords = await Attendance.find({
      userId: employeeId,
      date: {
        $gte: start,
        $lte: end
      }
    }).populate('siteId', 'name')
      .sort('date');

    // Get all holidays in date range
    const holidays = await Holiday.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort('date');

    // Calculate total days in range (inclusive of both start and end dates)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) ;
    
    // Initialize counters
    let presentDays = 0;
    let absentDays = 0;
    let holidayDays = 0;

    // Create a map of dates for quick lookup
    const attendanceMap = new Map(
      attendanceRecords.map(record => [
        record.date.toISOString().split('T')[0],
        record
      ])
    );

    // Create a map of holidays for quick lookup
    const holidayMap = new Map(
      holidays.map(holiday => [
        holiday.date.toISOString().split('T')[0],
        holiday
      ])
    );

    // Generate daily status array
    const dailyStatus = [];
    const currentDate = new Date(start);
    const lastDate = new Date(end);
    
    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const record = attendanceMap.get(dateStr);
      const holiday = holidayMap.get(dateStr);

      if (holiday) {
        holidayDays++;
        dailyStatus.push({
          date: dateStr,
          status: 'holiday',
          holidayName: holiday.name,
          holidayDescription: holiday.description
        });
      } else if (record) {
        presentDays++;
        dailyStatus.push({
          date: dateStr,
          status: record.status,
          checkIn: record.checkIn?.time || null,
          checkOut: record.checkOut?.time || null,
          shift:record.shift || null
        });
      } else {
        absentDays++;
        dailyStatus.push({
          date: dateStr,
          status: 'absent'
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      employee: {
        name: employee.name,
        employeeCode: employee.employeeCode,
        profileImage: employee.profileImage
      },
      reportPeriod: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      summary: {
        totalDays,
        presentDays,
        absentDays,
        holidayDays
      },
      dailyStatus
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error generating employee report',
      error: error.message
    });
  }
};

// Get employee attendance detail for a specific date
exports.getEmployeeDateDetail = async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId: employeeId,
      date: {
        $gte: targetDate,
        $lt: nextDay
      }
    }).populate('userId', 'name employeeCode profileImage')
      .populate('siteId', 'name');

    if (!attendance) {
      return res.status(404).json({
        message: 'No attendance record found for this date'
      });
    }

    const detail = {
      employee: {
        name: attendance.userId.name,
        employeeCode: attendance.userId.employeeCode,
        profileImage: attendance.userId.profileImage
      },
      site: attendance.siteId.name,
      date: attendance.date,
      status: attendance.status,
      isHoliday: attendance.isHoliday,
      checkIn: attendance.checkIn ? {
        time: attendance.checkIn.time,
        location: attendance.checkIn.location,
        photo: attendance.checkIn.photo
      } : null,
      checkOut: attendance.checkOut ? {
        time: attendance.checkOut.time,
        location: attendance.checkOut.location,
        photo: attendance.checkOut.photo
      } : null,
      workImages: attendance.workImages.map(wi => ({
        images: wi.images,
        message: wi.message,
        timestamp: wi.timestamp
      }))
    };

    res.json(detail);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching employee attendance detail',
      error: error.message
    });
  }
};

// Get all employees (users with role 'user')
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ 
      role: 'user' 
    }).select('-password');

    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// Get enabled employees
exports.getEnabledEmployees = async (req, res) => {
  try {
    const employees = await User.find({ 
      role: 'user',
      isEnabled: true 
    }).select('-password');

    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching enabled employees',
      error: error.message
    });
  }
};

// Admin update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;
    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const employee = await User.findByIdAndUpdate(
      employeeId,
      updates,
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Update shift timings
exports.updateShift = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startTime, endTime, timeZone } = req.body;

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: 'Invalid time format. Use HH:mm (24-hour format)'
      });
    }

    const employee = await User.findByIdAndUpdate(
      employeeId,
      {
        shift: { startTime, endTime, timeZone }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Shift timings updated successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating shift timings',
      error: error.message
    });
  }
}; 


// Reset user password to default (production-safe)
exports.resetPassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log('====================================');
    console.log(employeeId);
    console.log('====================================');

    const user = await User.findOne({"_id":employeeId});

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPassword = User.prototype.generateDefaultPassword.call({ name: user.name });

    user.password = newPassword;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Password has been reset successfully',
      user: userResponse,
      newPassword: newPassword
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get employee payslip
exports.getEmployeePayslip = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { payType, startDate, endDate } = req.query;

    // Validate payType
    if (!payType || !['hourly', 'daily'].includes(payType)) {
      return res.status(400).json({ 
        message: 'Invalid pay type. Must be either "hourly" or "daily"' 
      });
    }

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required' 
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get employee details
    const employee = await User.findById(employeeId)
      .select('name employeeCode hourSalary daySalary');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get attendance records for the period
    const attendanceRecords = await Attendance.find({
      userId: employeeId,
      date: {
        $gte: start,
        $lte: end
      },
      status: 'present'
    });

    let totalHours = 0;
    let totalDays = 0;
    let totalAmount = 0;

    // Calculate hours/days and amount based on pay type
    if (payType === 'hourly') {
      // Calculate total hours from attendance records
      attendanceRecords.forEach(record => {
        if (record.checkIn && record.checkOut) {
          const checkInTime = new Date(record.checkIn.time);
          const checkOutTime = new Date(record.checkOut.time);
          const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
          totalHours += hoursWorked;
        }
      });

      totalAmount = totalHours * employee.hourSalary;
    } else {
      // For daily pay, count each present day
      totalDays = attendanceRecords.length;
      totalAmount = totalDays * employee.daySalary;
    }

    // Generate payslip
    const payslip = {
      employee: {
        name: employee.name,
        employeeCode: employee.employeeCode
      },
      period: {
        startDate: start,
        endDate: end
      },
      payType,
      details: payType === 'hourly' ? {
        totalHours,
        ratePerHour: employee.hourSalary,
        totalAmount
      } : {
        totalDays,
        ratePerDay: employee.daySalary,
        totalAmount
      },
      attendanceRecords: attendanceRecords.map(record => ({
        date: record.date,
        checkIn: record.checkIn?.time,
        checkOut: record.checkOut?.time,
        hoursWorked: record.checkIn && record.checkOut ? 
          (new Date(record.checkOut.time) - new Date(record.checkIn.time)) / (1000 * 60 * 60) : 0
      }))
    };

    res.json(payslip);
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({
      message: 'Error generating payslip',
      error: error.message
    });
  }
};
