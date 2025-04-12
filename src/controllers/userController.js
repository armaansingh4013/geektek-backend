const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { deleteFile } = require('../utils/fileUtils');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber,department, designation} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or name already exists' 
      });
    }

    // Generate employee code
    const employeeCode = await User.generateEmployeeCode();

    // Create new user with default password
    const user = new User({
      name,
      email,
      employeeCode,
      phoneNumber,
      department,
      designation,
      role:"user",
      password: User.prototype.generateDefaultPassword.call({ name })
    });

    await user.save();

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
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    
    const { name, email, profileImage } = req.body;

    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If updating profile image, delete the old one
    if (profileImage && currentUser.profileImage && profileImage !== currentUser.profileImage) {
      await deleteFile(currentUser.profileImage);
    }

    // Only allow updating specific fields
    const updates = {
      ...(name && { name }),
      ...(email && { email }),
      ...(profileImage && { profileImage })
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error changing password',
      error: error.message
    });
  }
}; 