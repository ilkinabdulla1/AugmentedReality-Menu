const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const modelExtensions = ['.glb', '.gltf', '.fbx', '.obj'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'imagePath' && imageExtensions.includes(ext)) {
    cb(null, true); // Allow image files
  } else if (file.fieldname === 'threeDFile' && modelExtensions.includes(ext)) {
    cb(null, true); // Allow 3D model files
  } else {
    cb(new Error(`Unsupported file type for ${file.fieldname}`));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

module.exports = upload;
