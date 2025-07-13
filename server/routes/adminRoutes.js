const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Team = require('../models/Team');

// GET all users for admin panel
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET all teams for admin panel
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find({})
            .populate('leader', 'name')
            .populate('members', 'name');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT update a user's role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'team-leader', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.role = role;
        await user.save();
        res.json({ message: 'User role updated successfully.', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;