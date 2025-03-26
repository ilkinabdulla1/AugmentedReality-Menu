const Restaurant = require('../model/restaurant'); // Import restaurant model

// Fetch restaurant details
exports.getRestaurantInfo = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne();
        res.json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant info:', error);
        res.status(500).json({ error: 'Error fetching restaurant info' });
    }
};

// Update restaurant details
exports.updateRestaurantInfo = async (req, res) => {
    const updateData = req.body;

    try {
        const updatedRestaurant = await Restaurant.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true
        });
        res.json(updatedRestaurant);
    } catch (error) {
        console.error('Error updating restaurant info:', error);
        res.status(500).json({ error: 'Error updating restaurant info' });
    }
};
