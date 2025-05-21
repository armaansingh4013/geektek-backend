const mongoose = require('mongoose');

const estimationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    additionalDocument: {
      type: String,
    },
    estimations: [{
      name: {
        type: String,
        required: true
      },
      rates: {
        high: {
          type: Number,
          required: true
        },
        mid: {
          type: Number,
          required: true
        },
        low: {
          type: Number,
          required: true
        }
      },
      vat: {
        type: Boolean,
        default: false
      },
      hasDimensions: {
        type: Boolean,
        default: true
      },
      selectedRate: {
        type: String,
        enum: ['high', 'mid', 'low'],
        required: true
      },
      rows: [{
        length: {
          type: Number,
          required: true
        },
        width: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }]
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Estimation', estimationSchema);