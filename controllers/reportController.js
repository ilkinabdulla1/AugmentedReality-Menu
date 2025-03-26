const Order = require('../model/order'); // Import order model

// Fetch sales data
exports.getSalesData = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Error fetching sales data' });
    }
};

// Fetch performance metrics
exports.getPerformanceMetrics = async (req, res) => {
    try {
        const metrics = await Order.aggregate([
            { $group: { _id: '$menuItem', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({ error: 'Error fetching performance metrics' });
    }
};
