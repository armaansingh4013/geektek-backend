const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    images: [
      {
        imageUrl: String,
        public_id: String
      }
    ],
    videos: [
      {
        url: String,
        public_id: String
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
