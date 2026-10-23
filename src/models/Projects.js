const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        imageUrl: String,
        public_id: String
      }
    ],
    description: {
      type: String,
      default: '',
    },
    address: {
        type: String,
        default: '',
      },
    isActive: {
      type: Boolean,
      default: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // optional: if you want to track who added the Project
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Project', projectSchema);
