const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeCode: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
  },
  designation: {
    type: String,
  },
  phoneNumber: {
    type: Number
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  profileImage: {
    imageUrl: String,
    public_id: String
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Settings.shifts'
  },
  passportNumber: {
    type: String,
    default: ''
  },
  passportPhoto: {
    type: String,
    default: null
  },
  insuranceNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  bankDetails: {
    accountNumber: {
      type: String,
      default: ''
    },
    sortCode: {
      type: String,
      default: ''
    },
    accountName: {
      type: String,
      default: ''
    }
  },
  hourSalary: {
    type: Number,
    default: 0
  },
  daySalary: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  documents:{
    type: Boolean
  }
});

// Generate default password based on name
userSchema.methods.generateDefaultPassword = function() {
  const firstName = this.name.split(' ')[0];
  return `${firstName}@123`;
};

// Generate employee code
userSchema.statics.generateEmployeeCode = async function() {
  const lastUser = await this.findOne().sort({ employeeCode: -1 });
  
  if (!lastUser) {
    return 'EMP0001';
  }

  const lastNumber = parseInt(lastUser.employeeCode.replace('EMP', ''));
  const nextNumber = lastNumber + 1;
  
  // If we reach 9999, continue with 10000
  return `EMP${nextNumber.toString().padStart(4, '0')}`;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords in User model');
  console.log('Candidate password:', candidatePassword);
  console.log('Stored hashed password:', this.password);
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('Password comparison result:', result);
  return result;
};

module.exports = mongoose.model('User', userSchema); 