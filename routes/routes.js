const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../model/admins'); // Ensure this path is correct
const authenticateToken = require('../middleware/auth'); // Ensure this path is correct
const upload = require('../middleware/upload'); // Adjust path as needed
const Category = require('../model/category'); // Adjust the path based on your project structure
const MenuItem = require('../model/menu'); // Ensure the correct path to your MenuItem schema
const Restaurant = require('../model/restaurant'); // Restaurant schema
const ARModel = require('../model/arContent'); // AR Model schema
const multer = require('multer'); // For file uploads
const path = require('path');
const Menu = require('../model/menu'); // Adjust path
const Notification = require('../model/notification'); // Adjust the path as needed
const { addNotification } = require('../services/notificationService');




// --------------------- Home Page Routes ---------------------

// Root Route
router.get('/', (req, res) => {
  res.render('home', { message: 'Welcome to the Homepage!' });
});

// Example additional route
router.get('/about', (req, res) => {
  res.render('about', { message: 'About Page' });
});
  



// --------------------- Login Page Routes ---------------------
router.get('/login', (req, res) => {
  res.render('login'); // Assuming register.ejs is in your views folder
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check if the admin exists in the database
      const admin = await Admin.findOne({ email: email });
      if (!admin) {
          return res.render('login', { errorMessage: 'Admin not found' });
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
          return res.render('login', { errorMessage: 'Invalid password' });
      }

      // Issue JWT token
      const payload = {
          admin: {
              id: admin.id
          }
      };

      const jwtSecret = process.env.JWT_SECRET || "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";
      jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { httpOnly: true }); // Set cookie with JWT token
          res.redirect('/dashboard');
      });

  } catch (error) {
      console.error('Error logging in admin:', error);
      res.render('login', { errorMessage: 'Server error' });
  }
});



// --------------------- Register Page Routes ---------------------
router.get('/register', (req, res) => {
    res.render('register'); // Assuming register.ejs is in your views folder
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if email already exists in the database
      const existingAdmin = await Admin.findOne({ email: email });
      if (existingAdmin) {
        return res.render('register', { errorMessage: 'Email already exists' });
      }
  
      // Validate the password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.render('register', { errorMessage: 'Password must be at least 6 characters long and contain at least one uppercase and one lowercase letter' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new admin document
      const newAdmin = new Admin({
        name: name,
        email: email,
        password: hashedPassword
      });
  
      // Save the new admin document to the database
      await newAdmin.save();
      console.log('Admin registered successfully');
  
      // Redirect to a success page or login page
      res.redirect('/login');
    } catch (error) {
      console.error('Error registering admin:', error);
      res.render('register', { errorMessage: 'Server error' });
    }
  });


// --------------------- Profile Page Routes ---------------------

// Dashboard Route
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Fetch total statistics
    const totalMenuItems = await Menu.countDocuments();
    const total3DModels = await Menu.countDocuments({ threeDFilePath: { $exists: true, $ne: null } });
    const pending3DModels = await Menu.countDocuments({ threeDFilePath: null });
    const restaurantsOnboarded = await Restaurant.countDocuments();

    // Fetch recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5); // Fetch the 5 most recent notifications

    res.render('dashboard', {
      totalMenuItems,
      total3DModels,
      pending3DModels,
      restaurantsOnboarded,
      recentNotifications,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Server error');
  }
});


router.get('/staff-dashboard-data', async (req, res) => {
  try {
    const totalMenuItems = await Menu.countDocuments();
    const total3DModels = await Menu.countDocuments({ threeDFilePath: { $exists: true, $ne: null } });
    const pending3DModels = await Menu.countDocuments({ threeDFilePath: null });
    const restaurantsOnboarded = await Restaurant.countDocuments();

    res.json({
      totalMenuItems,
      total3DModels,
      pending3DModels,
      restaurantsOnboarded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


// --------------------- Profile Page Routes ---------------------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
      const admin = await Admin.findById(req.admin.id).select('-password');
      if (!admin) {
          return res.status(404).send('Admin not found');
      }
      res.render('profile', { admin });
  } catch (error) {
      console.error('Error fetching admin:', error);
      res.status(500).send('Server error');
  }
});

router.post('/profile', authenticateToken, upload.single('picture'), async (req, res) => {
  try {
      const { name, bio } = req.body;
      const picture = req.file ? '/images/' + req.file.filename : null; // Construct path to store in database

      // Find the admin by ID and update the fields
      const updatedFields = { name, bio };
      if (picture) {
          updatedFields.picture = picture;
      }

      const admin = await Admin.findByIdAndUpdate(req.admin.id, updatedFields, { new: true });

      if (!admin) {
          return res.status(404).send('Admin not found');
      }

      res.render('profile', { admin, successMessage: 'Profile updated successfully' });
  } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).send('Server error');
  }
});


// --------------------- Dashboard Page Routes ---------------------
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Fetch total statistics
    const totalMenuItems = await Menu.countDocuments();
    const total3DModels = await Menu.countDocuments({ threeDFilePath: { $exists: true, $ne: null } });
    const pending3DModels = await Menu.countDocuments({ threeDFilePath: null });
    const restaurantsOnboarded = await Restaurant.countDocuments();

    // Fetch pending restaurants (sort by menu count in ascending order)
    const pendingRestaurants = await Restaurant.aggregate([
      {
        $lookup: {
          from: 'menus', // Match the name of your Menu collection
          localField: '_id',
          foreignField: 'restaurant',
          as: 'menus',
        },
      },
      {
        $addFields: {
          menuCount: { $size: '$menus' }, // Add a menuCount field
        },
      },
      {
        $sort: { menuCount: 1 }, // Sort by menu count in ascending order
      },
    ]).limit(5); // Adjust the limit as needed

    // Fetch recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5); // Fetch the 5 most recent notifications

    // Render the dashboard view with all variables
    res.render('dashboard', {
      totalMenuItems,
      total3DModels,
      pending3DModels,
      restaurantsOnboarded,
      recentNotifications,
      pendingRestaurants, // Pass the pending restaurants to the view
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Server error');
  }
});



router.get('/top-pending-restaurants', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.aggregate([
      {
        $lookup: {
          from: 'menus', // Match the name of the `Menu` collection in your database
          localField: '_id',
          foreignField: 'restaurant',
          as: 'menus',
        },
      },
      {
        $addFields: {
          menuCount: { $size: '$menus' }, // Add the count of menu items
        },
      },
      {
        $sort: { menuCount: 1 }, // Sort by menu count in ascending order
      },
    ]);

    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching pending restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch pending restaurants' });
  }
});

// Route to display all menu items categorized
router.get('/menu-items', authenticateToken, async (req, res) => {
  try {
    // Fetch categories and their associated menu items
    const categorizedMenuItems = await Category.find().lean();
    const menuItemsByCategory = {};

    for (const category of categorizedMenuItems) {
      const menuItems = await Menu.find({ category: category._id }).populate('restaurant', 'name');
      menuItemsByCategory[category.name] = menuItems;
    }

    res.render('menu-items', {
      admin: req.admin, // Pass admin details
      menuItemsByCategory, // Pass menu items grouped by category
    });
  } catch (error) {
    console.error('Error fetching categorized menu items:', error);
    res.status(500).send('Server error');
  }
});

// Route to fetch menu items with 3D models
router.get('/menu-items-with-3d', authenticateToken, async (req, res) => {
  try {
    const menuItemsWith3D = await Menu.find({ threeDFilePath: { $exists: true, $ne: null } }).populate('category restaurant');
    res.render('menu-items-with-3d', {
      menuItems: menuItemsWith3D,
    });
  } catch (error) {
    console.error('Error fetching menu items with 3D models:', error);
    res.status(500).send('Server error');
  }
});

// Route to fetch menu items pending 3D models
router.get('/menu-items-pending-3d', authenticateToken, async (req, res) => {
  try {
    const menuItemsPending3D = await Menu.find({ threeDFilePath: { $exists: false } }).populate('category restaurant');
    res.render('menu-items-pending-3d', {
      menuItems: menuItemsPending3D,
    });
  } catch (error) {
    console.error('Error fetching menu items pending 3D models:', error);
    res.status(500).send('Server error');
  }
});


// --------------------- Menu Management Routes ---------------------
router.get('/menu-management', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find(); // Fetch all restaurants
    const selectedRestaurant = null; // No restaurant selected by default
    const menus = []; // Empty menu list for initial load

    res.render('menu-management', {
      admin: req.admin, // Admin details
      restaurants,      // List of all restaurants
      selectedRestaurant,
      menus,
    });
  } catch (error) {
    console.error('Error rendering menu-management page:', error);
    res.status(500).send('Server error');
  }
});

// Add New Menu Item
router.post('/menu-management/add', upload.single('arModel'), async (req, res) => {
  try {
    const { name, price, category, ingredients } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null;

    const newMenuItem = new MenuItem({
      name,
      price,
      category,
      ingredients,
      imagePath,
    });

    await newMenuItem.save();
    res.redirect('/menu-management');
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).send('Server error');
  }
});

// Edit Menu Item
router.post('/menu-management/add', authenticateToken, async (req, res) => {
  const { name, price, category, ingredients, calories, tags } = req.body;
  
  try {
    // Validate that the category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).send('Invalid category selected.');
    }

    const newItem = new MenuItem({
      name,
      price,
      category, // This is now an ObjectId
      ingredients,
      calories,
      tags
    });

    await newItem.save();
    res.redirect('/menu-management');
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).send('Server error');
  }
});

// Delete Menu Item
router.get('/menu-management/:id/delete', authenticateToken, async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).send('Menu item not found');
    }

    await Menu.findByIdAndDelete(req.params.id);

    // Notification for menu item deletion
    await addNotification({
      message: `Menu item deleted: ${menuItem.name}`,
      type: 'warning',
      relatedEntity: menuItem._id,
      entityType: 'MenuItem',
      priority: 'high',
    });

    res.redirect(`/menu-management/${menuItem.restaurant}`);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).send('Server error');
  }
});


// Add New Category
router.post('/menu-management/category/add', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = new Category({ name });
    await newCategory.save();
    res.redirect('/menu-management');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Server error');
  }
});

// Edit Category
router.post('/menu-management/category/:id/edit', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.redirect('/menu-management');
  } catch (error) {
    console.error('Error editing category:', error);
    res.status(500).send('Server error');
  }
});

// Delete Category
router.get('/menu-management/category/:id/delete', authenticateToken, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/menu-management');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Server error');
  }
});


router.get('/menu-management/:restaurantId?', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch all restaurants for the dropdown
    const restaurants = await Restaurant.find();

    let selectedRestaurant = null;
    let menuItems = [];

    if (restaurantId) {
      // If a restaurantId is provided, fetch the restaurant and its menu items
      selectedRestaurant = await Restaurant.findById(restaurantId);

      if (!selectedRestaurant) {
        return res.status(404).send('Restaurant not found');
      }

      // Fetch menu items for the selected restaurant
      menuItems = await Menu.find({ restaurant: restaurantId }).populate('category');
    }

    // Fetch all categories for the dropdown
    const categories = await Category.find();

    // Render the template with the admin, restaurants, and menu items
    res.render('menu-management', {
      admin: req.admin, // Pass admin from the authenticated request
      selectedRestaurant,
      menuItems,
      restaurants,
      categories,
    });
  } catch (error) {
    console.error('Error rendering menu management page:', error);
    res.status(500).send('Server error');
  }
});



// Route to handle adding a new menu item
router.post('/menu-management/:restaurantId/add', upload.single('imagePath'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const restaurant = req.params.restaurantId;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newMenuItem = new Menu({
      name,
      price,
      category,
      restaurant,
      imagePath,
    });

    await newMenuItem.save();

    // Notification for new menu item
    await addNotification({
      message: `New menu item added: ${name} for restaurant: ${restaurant}`,
      type: 'success',
      relatedEntity: newMenuItem._id,
      entityType: 'MenuItem',
      priority: 'medium',
    });

    res.redirect(`/menu-management/${restaurant}`);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).send('Server Error');
  }
});


router.post('/menu-management/:restaurantId/delete-multiple', authenticateToken, async (req, res) => {
  try {
    const { menuItems } = req.body;

    // Check if any items were selected
    if (!menuItems || menuItems.length === 0) {
      return res.status(400).send('No items selected for deletion.');
    }

    // Delete the selected menu items
    await Menu.deleteMany({ _id: { $in: menuItems } });

    // Redirect back to the menu-management page for the selected restaurant
    res.redirect(`/menu-management/${req.params.restaurantId}`);
  } catch (error) {
    console.error('Error deleting selected menu items:', error);
    res.status(500).send('Server error');
  }
});


// Route to render the edit menu page
router.get('/menu-management/:menuId/edit', async (req, res) => {
  try {
    const menuId = req.params.menuId;

    // Find the menu item by its ID and populate related fields
    const menuItem = await Menu.findById(menuId).populate('category restaurant');

    if (!menuItem) {
      return res.status(404).send('Menu item not found');
    }

    // Fetch all categories for the dropdown
    const categories = await Category.find();

    res.render('menu-edit', {
      menuItem,        // Pass the menu item to the view
      categories,      // Pass the categories for the dropdown
      admin: req.admin, // Ensure `req.admin` is passed
    });
  } catch (error) {
    console.error('Error loading edit menu page:', error);
    res.status(500).send('Server error');
  }
});


// Route to handle updating a menu item
router.post(
  '/menu-management/:menuId/update',
  upload.fields([
    { name: 'imagePath', maxCount: 1 }, // Handle image uploads
    { name: 'threeDFile', maxCount: 1 } // Handle 3D file uploads
  ]),
  async (req, res) => {
    try {
      const menuId = req.params.menuId;

      // Extract form data
      const { name, price, category } = req.body;

      // Ensure required fields are provided
      if (!name || !price || !category) {
        return res.status(400).send('Name, price, and category are required');
      }

      // Prepare updates object
      const updates = { name, price, category };

      // Process image upload
      if (req.files && req.files['imagePath'] && req.files['imagePath'][0]) {
        updates.imagePath = `/uploads/${req.files['imagePath'][0].filename}`;
      }

      // Process 3D file upload
      if (req.files && req.files['threeDFile'] && req.files['threeDFile'][0]) {
        updates.threeDFilePath = `/uploads/${req.files['threeDFile'][0].filename}`;
      }

      // Update the menu item in the database
      const updatedMenu = await Menu.findByIdAndUpdate(menuId, updates, { new: true });

      if (!updatedMenu) {
        return res.status(404).send('Menu item not found');
      }

      // Redirect to the menu management page
      res.redirect(`/menu-management/${menuId}/edit`);
    } catch (error) {
      console.error('Error updating menu item:', error);

      // Render an error page with detailed information
      res.status(500).send('Server error');
    }
  }
);


router.post(
  '/menu-management/:id/upload-3d-inline',
  upload.single('threeDFile'),
  async (req, res) => {
    try {
      const menuId = req.params.id;

      // Find the menu item by ID
      const menuItem = await Menu.findById(menuId);
      if (!menuItem) {
        return res.status(404).send('Menu item not found');
      }

      // Save the uploaded file path
      menuItem.threeDFilePath = `/uploads/${req.file.filename}`;
      await menuItem.save();

      // Redirect back to the pending 3D models list
      res.redirect('/menu-items-pending-3d');
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      res.status(500).send('Server error');
    }
  }
);


// --------------------- Restaurant Management Routes ---------------------
router.get('/restaurant-management', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate({
      path: 'menus',
      select: 'name', // Fetch only the name of the menus
    });
    res.render('restaurant-management', {
      admin: req.admin, // Pass admin details
      restaurants, // Pass restaurants to the view
    });
  } catch (error) {
    console.error('Error rendering restaurant-management page:', error);
    res.status(500).send('Server error');
  }
});

router.post('/restaurant-management/add-or-edit', authenticateToken, async (req, res) => {
  try {
    const { id, name, address, contact, businessHours } = req.body;

    if (id) {
      // Edit an existing restaurant
      await Restaurant.findByIdAndUpdate(id, { name, address, contact, businessHours }, { new: true });

      // Add notification for editing
      await addNotification({
        message: `Restaurant updated: ${name}`,
        type: 'info',
        relatedEntity: id,
        entityType: 'Restaurant',
        priority: 'low',
      });
    } else {
      // Add a new restaurant
      const newRestaurant = new Restaurant({ name, address, contact, businessHours });
      await newRestaurant.save();

      // Add notification for adding
      await addNotification({
        message: `New restaurant added: ${name}`,
        type: 'success',
        relatedEntity: newRestaurant._id,
        entityType: 'Restaurant',
        priority: 'medium',
      });
    }

    res.redirect('/restaurant-management'); // Redirect back to the management page
  } catch (error) {
    console.error('Error adding/editing restaurant:', error);
    res.status(500).send('Server error');
  }
});


// Delete a Restaurant
router.get('/restaurant-management/:id/delete', authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    // Notification for deletion
    await addNotification({
      message: `Restaurant deleted: ${restaurant.name}`,
      type: 'warning',
      relatedEntity: restaurant._id,
      entityType: 'Restaurant',
      priority: 'high',
    });

    res.redirect('/restaurant-management');
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).send('Server error');
  }
});

// Render Menus for a Specific Restaurant
router.get('/restaurant-management/:id/menus', authenticateToken, async (req, res) => {
  try {
    // Fetch the specific restaurant along with its menus
    const restaurant = await Restaurant.findById(req.params.id).populate('menus');
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    // Render the menu-management page
    res.render('menu-management', {
      admin: req.admin, // Pass the admin object
      restaurant, // Pass the restaurant object
    });
  } catch (error) {
    console.error('Error loading menu-management page:', error);
    res.status(500).send('Server error');
  }
});


// Add a New Menu for a Specific Restaurant
router.post('/restaurant-management/:id/menus/add', authenticateToken, async (req, res) => {
  const { menuName } = req.body;

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    const newMenu = new Menu({ name: menuName, restaurant: restaurant._id });
    await newMenu.save();

    restaurant.menus.push(newMenu._id);
    await restaurant.save();

    // Notification for new menu
    await addNotification({
      message: `New menu added: ${menuName} for restaurant: ${restaurant.name}`,
      type: 'success',
      relatedEntity: newMenu._id,
      entityType: 'Menu',
      priority: 'medium',
    });

    res.redirect(`/restaurant-management/${restaurant._id}/menus`);
  } catch (error) {
    console.error('Error adding menu:', error);
    res.status(500).send('Server error');
  }
});



// ------------------------  Categories Management Routes -------------------------
// Render Category Management Page
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch categories from DB
    res.render('categories', {
      admin: req.admin, // Pass admin details if available
      categories, // Pass categories to the view
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
});


// Add New Category
router.post('/categories/add', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = new Category({ name });
    await newCategory.save();

    // Notification for new category
    await addNotification({
      message: `New category added: ${name}`,
      type: 'success',
      relatedEntity: newCategory._id,
      entityType: 'Category',
      priority: 'medium',
    });

    res.redirect('/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Server error');
  }
});


// Delete Category
router.get('/categories/:id/delete', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Server error');
  }
});


// Route to render the edit category page
router.get('/categories/:id/edit', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).send('Category not found');
    }

    res.render('category-edit', { category });
  } catch (error) {
    console.error('Error fetching category for editing:', error);
    res.status(500).send('Server error');
  }
});

// Route to handle category updates
router.post('/categories/:id/edit', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Category name is required');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } // Return the updated category
    );

    if (!updatedCategory) {
      return res.status(404).send('Category not found');
    }

    res.redirect('/categories'); // Redirect back to categories list
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send('Server error');
  }
});


  module.exports = router;
