// server/routes/userRoutes.js (create this file)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
    try {
        // Only return users who are members of any of the current user's teams
        // Or, for simplicity, return all users for now.
        // For better security/scalability, only return users relevant to the current user's teams.
        const users = await User.find({}).select('-password'); // Exclude password field
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;