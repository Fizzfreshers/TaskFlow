const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); //
const User = require('../models/User'); //
const Team = require('../models/Team'); //

router.get('/me', protect, (req, res) => {
    res.json(req.user);
});


router.get('/', protect, async (req, res) => {
    try {
        let users;
        if (req.user.role === 'admin') {
            // Admins can see all users.
            users = await User.find({}).select('-password');
        } else {
            // Non-admins see users who are in at least one of their teams.
            const userTeams = await Team.find({ members: req.user._id }).select('members');
            const memberIds = new Set();
            userTeams.forEach(team => {
                team.members.forEach(memberId => memberIds.add(memberId));
            });
            users = await User.find({ '_id': { $in: Array.from(memberIds) } }).select('-password');
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;