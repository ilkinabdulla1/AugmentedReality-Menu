const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes leading and trailing whitespaces
  },
  address: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    match: /.+\@.+\..+/, // Simple regex for validating email format
  },
  businessHours: {
    type: String,
    trim: true,
  },
  menus: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
    },
  ],
  active: {
    type: Boolean,
    default: true, // Indicates whether the restaurant is currently active
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0, // Average rating of the restaurant
    },
    totalReviews: {
      type: Number,
      default: 0, // Number of reviews received
    },
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically updates modification date
  },
});

// Middleware to update the `updatedAt` field on every save
restaurantSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
