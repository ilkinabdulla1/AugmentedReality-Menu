const mongoose = require('mongoose');

// Define the AR content schema
const arContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // Title for the AR content
  },
  url: {
    type: String,
    required: true // URL where the AR file is hosted
  },
  associatedMenuItem: {
    type: mongoose.Schema.Types.ObjectId, // Link to a menu item
    ref: 'Menu',
    required: false // Not required; may be standalone AR content
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the creation date
  }
});

// Create and export the model
const ARContent = mongoose.model('ARContent', arContentSchema);
module.exports = ARContent;
