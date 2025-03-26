const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Removes leading and trailing whitespaces
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Prevents negative prices
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to the Category model
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant', // Reference to the Restaurant model
      required: true,
    },
    description: {
      type: String,
      trim: true, // Optional field for a detailed description
    },
    imagePath: {
      type: String, // Path to the uploaded image
      validate: {
        validator: function (v) {
          // Optional validation for image file extensions
          return /\.(jpg|jpeg|png|gif)$/i.test(v);
        },
        message: 'Invalid image file format. Only JPG, JPEG, PNG, or GIF allowed.',
      },
    },
    threeDFilePath: {
      type: String, // Path to the uploaded 3D file
      validate: {
        validator: function (v) {
          // Optional validation for 3D file extensions
          return /\.(glb|gltf|obj|fbx)$/i.test(v);
        },
        message: 'Invalid 3D file format. Only GLB, GLTF, OBJ, or FBX allowed.',
      },
    },
    isAvailable: {
      type: Boolean,
      default: true, // Indicates if the menu item is currently available
    },
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0, // Average rating for the menu item
      },
      totalReviews: {
        type: Number,
        default: 0, // Number of reviews received
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` timestamps
  }
);

module.exports = mongoose.model('Menu', menuSchema);
