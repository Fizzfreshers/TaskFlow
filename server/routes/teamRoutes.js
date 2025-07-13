const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin, teamLeaderOrAdmin } = require('../middleware/roleMiddleware');
const Team = require('../models/Team');
const User = require('../models/User');

// Get all teams (for admin) or only user's teams (for non-admins).
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { members: req.user._id };
        const teams = await Team.find(query)
                                .populate('members', 'name email isOnline role')
                                .populate('owner', 'name email')
                                .populate('leader', 'name email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a team (Admin Only).
router.post('/', protect, admin, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required' });

    try {
        const teamExists = await Team.findOne({ name });
        if (teamExists) return res.status(400).json({ message: 'Team name already taken' });

        const team = new Team({ name, owner: req.user._id });
        const createdTeam = await team.save();
        res.status(201).json(createdTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a team (Admin Only). This also cleans up user associations.
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        await User.updateMany({ _id: { $in: team.members } }, { $pull: { teams: team._id } });
        await team.deleteOne();

        res.json({ message: 'Team and all member associations removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a member to a team (Admin or the specific Team Leader).
router.post('/:teamId/members', protect, teamLeaderOrAdmin, async (req, res) => {
    const { userId } = req.body;
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId);
        const user = await User.findById(userId);

        if (!team || !user) return res.status(404).json({ message: 'Team or User not found' });
        if (req.user.role !== 'admin' && (!team.leader || team.leader.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Only the admin or this team\'s leader can add members.' });
        }
        if (team.members.includes(userId)) return res.status(400).json({ message: 'User is already in this team' });

        team.members.push(userId);
        user.teams.push(teamId);

        await team.save();
        await user.save();
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove a member from a team (Admin or the specific Team Leader).
router.delete('/:teamId/members/:memberId', protect, teamLeaderOrAdmin, async (req, res) => {
    const { teamId, memberId } = req.params;
    try {
        const team = await Team.findById(teamId);
        const user = await User.findById(memberId);

        if (!team || !user) return res.status(404).json({ message: 'Team or User not found' });
        if (req.user.role !== 'admin' && (!team.leader || team.leader.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Only the admin or this team\'s leader can remove members.' });
        }
        if (team.owner.toString() === memberId) return res.status(400).json({ message: 'Cannot remove the team owner.' });

        team.members.pull(memberId);
        user.teams.pull(teamId);

        if (team.leader && team.leader.toString() === memberId) {
            team.leader = null;
            user.role = 'user'; // Demote user role if they were the leader
        }

        await team.save();
        await user.save();
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// assign a team leader
router.put('/:teamId/leader', protect, admin, async (req, res) => {
    const { userId } = req.body;
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId);
        const user = await User.findById(userId);

        if (!team || !user) return res.status(404).json({ message: 'Team or User not found' });
        if (!team.members.includes(userId)) return res.status(400).json({ message: 'User must be a member of the team to become a leader.' });

        if (team.leader) await User.findByIdAndUpdate(team.leader, { role: 'user' });

        team.leader = userId;
        user.role = 'team-leader';

        await team.save();
        await user.save();
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;