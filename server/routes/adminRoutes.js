const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Team = require('../models/Team');
const Notification = require('../models/Notifications');

// Get all users
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').populate('teams', 'name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all teams
router.get('/teams', protect, admin, async (req, res) => {
    try {
        const teams = await Team.find({}).populate('leader', 'name').populate('members', 'name');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:userId/role', protect, admin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.userId);
        if (user) {
            user.role = role;
            await user.save();
            const roleNotification = new Notification({
                recipient: req.params.userId,
                sender: req.user._id,
                type: 'role_change',
                message: `Your role has been changed to "${role}" by an administrator.`,
        });
            await roleNotification.save();
            req.io.to(req.params.userId).emit('newNotification', roleNotification)
            res.json({ message: 'User role updated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;