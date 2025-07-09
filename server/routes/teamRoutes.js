const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const Team = require('../models/Team');
const User = require('../models/User'); // Need User model to update user's teams array

// Get all teams current user is a member of
router.get('/', protect, async (req, res) => {
    try {
        const teams = await Team.find({ members: req.user._id })
                                .populate('members', 'name isOnline') // Populate members and their online status
                                .populate('owner', 'name');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new team
router.post('/', protect, admin, async (req, res) => {
    const { name } = req.body;
    try {
        const teamExists = await Team.findOne({ name });
        if (teamExists) {
            return res.status(400).json({ message: 'Team name already taken' });
        }

        const team = new Team({
            name,
            members: [req.user._id], // Creator is the first member
            owner: req.user._id,
        });
        const createdTeam = await team.save();

        // Add team to creator's user document
        await User.findByIdAndUpdate(req.user._id, { $push: { teams: createdTeam._id } });

        res.status(201).json(createdTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Join a team (by team ID)
router.post('/:id/join', protect, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        if (team.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member of this team' });
        }

        team.members.push(req.user._id);
        await team.save();

        // Add team to user's document
        await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

        res.json({ message: 'Joined team successfully', team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Leave a team
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Prevent owner from leaving without assigning new owner or deleting team
        if (team.owner.equals(req.user._id)) {
            return res.status(400).json({ message: 'Owners cannot leave a team without reassigning ownership or deleting it.' });
        }

        team.members = team.members.filter(memberId => !memberId.equals(req.user._id));
        await team.save();

        // Remove team from user's document
        await User.findByIdAndUpdate(req.user._id, { $pull: { teams: team._id } });

        res.json({ message: 'Left team successfully', team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;