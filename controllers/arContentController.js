const ARContent = require('../model/arContent'); // Import AR content model

// Fetch all AR content
exports.getAllARContent = async (req, res) => {
    try {
        const content = await ARContent.find();
        res.json(content);
    } catch (error) {
        console.error('Error fetching AR content:', error);
        res.status(500).json({ error: 'Error fetching AR content' });
    }
};

// Upload AR content
exports.addARContent = async (req, res) => {
    const { title, url } = req.body;

    try {
        const newContent = new ARContent({ title, url });
        await newContent.save();
        res.status(201).json(newContent);
    } catch (error) {
        console.error('Error uploading AR content:', error);
        res.status(500).json({ error: 'Error uploading AR content' });
    }
};

// Delete AR content
exports.deleteARContent = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedContent = await ARContent.findByIdAndDelete(id);

        if (!deletedContent) {
            return res.status(404).json({ error: 'AR content not found' });
        }

        res.json({ message: 'AR content deleted successfully' });
    } catch (error) {
        console.error('Error deleting AR content:', error);
        res.status(500).json({ error: 'Error deleting AR content' });
    }
};
