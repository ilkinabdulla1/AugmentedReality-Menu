const express = require('express');
const connectToDatabase = require('./data/database');
const routes = require('./routes/routes'); // Import your routes
const cookieParser = require('cookie-parser'); // Add cookie-parser
const path = require('path');
const fs = require('fs'); // Import the filesystem module

const app = express();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory ensured at:', uploadDir);
}

// Connect to MongoDB
const PORT = process.env.PORT || 3000;

// Middleware for static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookieParser()); // Use cookie-parser middleware

// Routes
app.use('/', routes); // Mount your routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
