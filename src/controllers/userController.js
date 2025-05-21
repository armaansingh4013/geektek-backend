const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { deleteFile } = require('../utils/fileUtils');
const cloudinary = require('../utils/cloudinary');
const Settings = require('../models/Settings');
const { sendWelcomeEmail, sendAdminNewUserNotification } = require('../utils/emailService');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, designation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or phone number already exists' 
      });
    }

    // Generate employee code
    const employeeCode = await User.generateEmployeeCode();

    // Generate default password
    const defaultPassword = User.prototype.generateDefaultPassword.call({ name });

    // Create new user
    const user = new User({
      name,
      email,
      employeeCode,
      phoneNumber,
      department,
      designation,
      role: "user",
      password: defaultPassword
    });

    await user.save();

    // Send welcome email to new user
    await sendWelcomeEmail(user, defaultPassword);

    // Find admin users and send notifications
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await sendAdminNewUserNotification(user, admin.email);
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'shiftId',
        select: 'name startTime endTime timeZone description isActive'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    

    // If user has no shift assigned or shift is not active, get the latest active shift
    
      const settings = await Settings.findOne({ type: 'shift' });
      console.log(settings);
      
      if (settings && settings.shifts.length > 0) {
        // Find the latest active shift
        const latestShift = settings.shifts
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

        if (latestShift) {
          user.shiftId = latestShift;
        }
        console.log(latestShift);
        
    
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Get current user data
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If updating profile image, delete the old one
    if (updates.profileImage && currentUser.profileImage && updates.profileImage !== currentUser.profileImage) {
      await deleteFile(currentUser.profileImage);
    }

    // If updating passport photo, delete the old one
    if (updates.passportPhoto && currentUser.passportPhoto && updates.passportPhoto !== currentUser.passportPhoto) {
      await deleteFile(currentUser.passportPhoto);
    }

    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete profile image if exists
    if (user.profileImage) {
      await deleteFile(user.profileImage);
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Self update for user (limited fields)
exports.updateSelf = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const { 
      name, 
      email,
      phoneNumber, 
      profileImage,
      passportNumber,
      passportPhoto,
      insuranceNumber,
      address,
      bankDetails,
      hourSalary,
      daySalary
    } = req.body;
    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If updating profile image, delete the old one
    if (profileImage && currentUser.profileImage && profileImage !== currentUser.profileImage) {
      try {
        await cloudinary.uploader.destroy(currentUser.profileImage.public_id);
        console.log(`Deleted from Cloudinary: ${currentUser.profileImage.public_id}`);
      } catch (err) {
        console.error(`Failed to delete ${currentUser.profileImage.public_id}`, err);
      }
    }

    // If updating passport photo, delete the old one
    if (passportPhoto && currentUser.passportPhoto && passportPhoto !== currentUser.passportPhoto) {
      await deleteFile(currentUser.passportPhoto);
      try {
        await cloudinary.uploader.destroy(currentUser.passportPhoto.public_id);
        console.log(`Deleted from Cloudinary: ${currentUser.passportPhoto.public_id}`);
      } catch (err) {
        console.error(`Failed to delete ${currentUser.passportPhoto.public_id}`, err);
      }
    }

    // Only allow updating specific fields
    const updates = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(profileImage && { profileImage }),
      ...(passportNumber && { passportNumber }),
      ...(passportPhoto && { passportPhoto }),
      ...(insuranceNumber && { insuranceNumber }),
      ...(address && { address }),
      ...(bankDetails && { bankDetails }),
      ...(hourSalary !== undefined && { hourSalary }),
      ...(daySalary !== undefined && { daySalary })
    };

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change own password (requires old password)
exports.changeOwnPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    console.log('Change password request:', { userId, currentPassword, newPassword });
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Set new password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    console.log('Password updated successfully');

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in changeOwnPassword:', error);
    res.status(500).json({
      message: 'Error changing password',
      error: error.message
    });
  }
}; 