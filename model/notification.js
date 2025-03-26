const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true, // Removes leading and trailing whitespaces
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error', 'system'], // Added 'system' for system-wide notifications
      default: 'info',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: false, // Optional, as notifications may be system-wide
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityType', // Dynamically references another model based on `entityType`
    },
    entityType: {
      type: String,
      enum: ['Restaurant', 'Menu', 'MenuItem', '3DModel'], // Defines the type of related entity
    },
    read: {
      type: Boolean,
      default: false, // Tracks if the notification has been read
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'], // Priority levels for notifications
      default: 'medium',
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically sets the creation date
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` timestamps
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
