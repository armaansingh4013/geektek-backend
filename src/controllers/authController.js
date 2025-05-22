const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Settings = require('../models/Settings');
// const { generateOTP, sendVerificationEmail, sendVerificationSMS, sendPasswordResetEmail } = require('../utils/notificationService');

// Register new user
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, phoneNumber } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { username }, { phoneNumber }] 
//     });
    
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: 'User with this email, username, or phone number already exists' 
//       });
//     }

//     // Create new user
//     const user = new User({
//       username,
//       email,
//       password,
//       phoneNumber
//     });

//     // Generate verification tokens
//     const emailToken = crypto.randomBytes(32).toString('hex');
//     const phoneOTP = generateOTP();

//     user.emailVerificationToken = emailToken;
//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//     user.phoneVerificationToken = phoneOTP;
//     user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await user.save();

//     // Send verification emails/SMS
//     await sendVerificationEmail(email, emailToken);
//     if (phoneNumber) {
//       await sendVerificationSMS(phoneNumber, phoneOTP);
//     }

//     res.status(201).json({ 
//       message: 'Registration successful. Please verify your email and phone number.' 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Login user
exports.login = async (req, res) => {
  try {
    const { employeeCode, password } = req.body;
    console.log('Login attempt for employee code:', employeeCode);

    // Find user by employee code
    const user = await User.findOne({ employeeCode });
    if (!user) {
      console.log('User not found for employee code:', employeeCode);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user._id);

    // Check if user is enabled
    if (!user.isEnabled) {
      console.log('User is disabled:', user._id);
      return res.status(403).json({ message: 'Your account has been disabled. Please contact administrator.' });
    }

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      "your_jwt_secret_key_here"
    );

    console.log('Login successful for user:', user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        employeeCode: user.employeeCode,
        department: user.department,
        designation: user.designation,
        role: user.role,
        documents:user.documents
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify email
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne({
//       emailVerificationToken: token,
//       emailVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired verification token' });
//     }

//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save();

//     res.json({ message: 'Email verified successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Verify phone number
// exports.verifyPhone = async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     const user = await User.findOne({
//       phoneNumber,
//       phoneVerificationToken: otp,
//       phoneVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     user.isPhoneVerified = true;
//     user.phoneVerificationToken = undefined;
//     user.phoneVerificationExpires = undefined;
//     await user.save();

//     res.json({ message: 'Phone number verified successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Request password reset
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

//     await user.save();
//     await sendPasswordResetEmail(email, resetToken);

//     res.json({ message: 'Password reset email sent' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Reset password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token, password } = req.body;

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired reset token' });
//     }

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.json({ message: 'Password reset successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select('-password');
    console.log(user);
    

    // If user has no shift assigned or shift is not active, get the latest active shift
    
      const settings = await Settings.findOne({ type: 'shift' });
      
      if (settings && settings.shifts.length > 0) {
        // Find the latest active shift
        const latestShift = settings.shifts
        .filter(shift => shift.endDate == null)
        if (latestShift) {
          user= {shift: `${latestShift[0].startTime} - ${latestShift[0].endTime}`,...user._doc};
        }
        console.log(latestShift[0].startTime);
        
    
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 