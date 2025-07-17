const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notifications');

// GET all notifications for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 }) // Show newest first
            .populate('sender', 'name');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT to mark all notifications as read
router.put('/mark-read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ** THIS IS THE NEW, WORKING DELETE ROUTE **
// DELETE a single notification by its ID
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Security check: Make sure the user trying to delete the notification is the recipient
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this notification' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notification removed' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;