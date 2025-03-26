const Menu = require('../model/menu'); // Import the menu model

// Fetch all menu items
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Error fetching menu items' });
    }
};

// Add a new menu item
exports.addMenu = async (req, res) => {
    const { name, category, price, arContent, description } = req.body;

    try {
        const newMenu = new Menu({
            name,
            category,
            price,
            arContent,
            description
        });

        await newMenu.save();
        res.status(201).json(newMenu);
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'Error adding menu item' });
    }
};

// Update a menu item
exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMenu) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json(updatedMenu);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Error updating menu item' });
    }
};

// Delete a menu item
exports.deleteMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMenu = await Menu.findByIdAndDelete(id);

        if (!deletedMenu) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Error deleting menu item' });
    }
};
