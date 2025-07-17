const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin, teamLeaderOrAdmin } = require('../middleware/roleMiddleware');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');

// --- GET All Teams (No changes needed here, but included for completeness) ---
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

// --- POST Create a Team (No changes needed here) ---
router.post('/', protect, admin, async (req, res) => {
    const { name, members } = req.body;

    if (!name || !members || members.length === 0) {
        return res.status(400).json({ message: 'Team name and at least one member are required.' });
    }

    try {
        const teamExists = await Team.findOne({ name });
        if (teamExists) return res.status(400).json({ message: 'Team name already exists' });
        
        const leaderId = members[0];
        const team = new Team({ name, owner: req.user._id, leader: leaderId, members: members });
        const createdTeam = await team.save();

        await User.updateMany({ _id: { $in: members } }, { $addToSet: { teams: createdTeam._id } });
        await User.findByIdAndUpdate(leaderId, { role: 'team-leader' });

        res.status(201).json(createdTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// --- DELETE a Team (Admin Only - No changes needed) ---
// Delete a team (Admin Only). This also cleans up user roles and associated tasks.
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const teamId = req.params.id;
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const members = team.members;

        // 1. Demote team leader if they are not an admin
        if (team.leader) {
            const leaderUser = await User.findById(team.leader);
            // Only demote if they are not an admin and not part of any other team as a leader
            if (leaderUser && leaderUser.role === 'team-leader') {
                 // Check if this user is a leader of any other team
                 const otherTeamsAsLeader = await Team.findOne({ leader: leaderUser._id, _id: { $ne: teamId } });
                 if (!otherTeamsAsLeader) {
                    leaderUser.role = 'user';
                    await leaderUser.save();
                 }
            }
        }

        // 2. Remove the team from every member's "teams" array
        await User.updateMany(
            { _id: { $in: members } },
            { $pull: { teams: teamId } }
        );

        // 3. Delete tasks that are ONLY assigned to this team and no other team or user
        await Task.deleteMany({
            teams: { $in: [teamId], $size: 1 }, // The task is in this team
            assignedTo: { $size: 0 }             // and is not assigned to any individual user
        });

        // 4. Finally, delete the team itself
        await team.deleteOne();

        res.json({ message: 'Team deleted, and roles and tasks have been cleaned up.' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ message: 'Server error during team deletion.' });
    }
});

// ***
// *** FIXED ROUTES START HERE ***
// ***

// --- POST Add a member to a team (FIXED) ---
router.post('/:teamId/members', protect, teamLeaderOrAdmin, async (req, res) => {
    const { userId } = req.body;
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId);
        const user = await User.findById(userId);

        if (!team || !user) return res.status(404).json({ message: 'Team or User not found' });

        // Authorization Check: Allows admin OR the specific leader of this team
        if (req.user.role !== 'admin' && team.leader?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized. Must be an admin or this team's leader." });
        }
        
        if (team.members.includes(userId)) return res.status(400).json({ message: 'User is already in this team' });

        team.members.push(userId);
        user.teams.push(teamId);

        await team.save();
        await user.save();
        
        const populatedTeam = await Team.findById(team._id).populate('leader', 'name').populate('members', 'name');
        res.json(populatedTeam);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- DELETE a member from a team (FIXED) ---
router.delete('/:teamId/members/:memberId', protect, teamLeaderOrAdmin, async (req, res) => {
    const { teamId, memberId } = req.params;
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        
        // Authorization Check
        if (req.user.role !== 'admin' && team.leader?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized. Must be an admin or this team's leader." });
        }

        // Prevent removing the team leader if they are the last member
        if (team.leader?.toString() === memberId && team.members.length === 1) {
            return res.status(400).json({ message: 'Cannot remove the last member who is also the team leader. Assign a new leader first.' });
        }

        const user = await User.findById(memberId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        team.members.pull(memberId);
        user.teams.pull(teamId);
        
        // If the removed member was the leader, assign a new leader from remaining members
        if (team.leader?.toString() === memberId) {
            const oldLeaderRole = await User.findById(memberId);
            if (oldLeaderRole) {
                oldLeaderRole.role = 'user'; // Demote role
                await oldLeaderRole.save();
            }

            team.leader = team.members[0]; // Assign the next person as leader
            if(team.leader) {
                await User.findByIdAndUpdate(team.leader, { role: 'team-leader' });
            }
        }
        
        await team.save();
        await user.save();
        res.json({ message: 'Member removed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- PUT Assign a team leader (FIXED) ---
router.put('/:teamId/leader', protect, teamLeaderOrAdmin, async (req, res) => {
    const { userId: newLeaderId } = req.body;
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        
        // Authorization check
        if (req.user.role !== 'admin' && team.leader?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized. Must be an admin or this team's leader." });
        }

        if (!team.members.includes(newLeaderId)) {
            return res.status(400).json({ message: 'User must be a member of the team to become a leader.' });
        }

        const oldLeaderId = team.leader;
        if (oldLeaderId) {
            await User.findByIdAndUpdate(oldLeaderId, { role: 'user' });
        }

        team.leader = newLeaderId;
        await User.findByIdAndUpdate(newLeaderId, { role: 'team-leader' });
        
        await team.save();
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;