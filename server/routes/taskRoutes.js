const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notifications');

// --- GET ALL TASKS (FIXED for Admin Visibility) ---
router.get('/', protect, async (req, res) => {
    try {
        let tasks;
        // If the user is an admin, fetch all tasks.
        if (req.user.role === 'admin') {
            tasks = await Task.find({})
                .populate('assignedTo', 'name email')
                .populate('teams', 'name')
                .populate('createdBy', 'name email');
        } else {
            // Otherwise, fetch tasks relevant to the user (creator, assignee, or team member)
            const userTeams = await Team.find({ members: req.user._id }).select('_id');
            const teamIds = userTeams.map(t => t._id);

            tasks = await Task.find({
                $or: [
                    { createdBy: req.user._id },
                    { assignedTo: req.user._id },
                    { teams: { $in: teamIds } }
                ]
            }).populate('assignedTo', 'name email').populate('teams', 'name').populate('createdBy', 'name email');
        }
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- CREATE A NEW TASK (UPDATED with new assignment logic) ---
router.post('/', protect, async (req, res) => {
    const { title, description, deadline, assignedTo, teams } = req.body;
    const creator = await User.findById(req.user._id);

    try {
        // --- Authorization Logic for Assignment ---
        if (assignedTo && assignedTo.length > 0) {
            if (creator.role === 'user') {
                return res.status(403).json({ message: "You are not authorized to assign tasks to individuals." });
            }
            if (creator.role === 'team-leader') {
                // Team leaders can only assign to members of teams they lead.
                const leaderTeams = await Team.find({ leader: creator._id });
                const manageableMemberIds = new Set(leaderTeams.flatMap(team => team.members.map(id => id.toString())));

                const isAssignmentValid = assignedTo.every(userId => manageableMemberIds.has(userId.toString()));
                if (!isAssignmentValid) {
                    return res.status(403).json({ message: "You can only assign tasks to members of your own team(s)." });
                }
            }
        }

        const isPrivate = !assignedTo?.length && !teams?.length;

        const task = new Task({
            title, description, deadline, assignedTo: assignedTo || [], teams: teams || [],
            createdBy: req.user._id,
            isPrivate
        });
        const createdTask = await task.save();

        // --- Notification Logic ---
        if (!isPrivate) {
            const recipients = new Set((assignedTo || []).map(id => id.toString()));
            if (teams && teams.length > 0) {
                const teamsWithMembers = await Team.find({ '_id': { $in: teams } }).select('members');
                teamsWithMembers.forEach(team => {
                    team.members.forEach(memberId => recipients.add(memberId.toString()));
                });
            }
            recipients.delete(req.user._id.toString());

            for (const recipientId of recipients) {
                const notification = new Notification({
                    recipient: recipientId,
                    sender: req.user._id,
                    type: 'task_assigned',
                    message: `You have been assigned to a new task: "${createdTask.title}" by ${creator.name}.`,
                    taskId: createdTask._id,
                });
                await notification.save();
                req.io.to(recipientId).emit('newNotification', notification);
            }
        }

        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// get a single task by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('teams', 'name')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If the task is private, only the creator can see it
        if (task.isPrivate && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this task' });
        }

        // basic auth: ensure user is involved with the task or its team
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);
        
        // check if user is in any of the assigned teams
        const isTeamMember = req.user.teams.some(userTeamId => 
            task.teams.some(taskTeam => taskTeam._id.equals(userTeamId))
        );

        if (isAssigned || isCreator || isTeamMember || req.user.role === 'admin') {
            res.json(task);
        } else {
            res.status(403).json({ message: 'Not authorized to view this task' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// update a task
router.put('/:id', protect, async (req, res) => {
    const { title, description, deadline, status, assignedTo, teams } = req.body;
    try {
        let task = await Task.findById(req.params.id);
        if (!task) { return res.status(404).json({ message: 'Task not found' }); }

        // Authorization: Only creator, assigned user, team leader, or admin can update
        const isCreator = task.createdBy.equals(req.user._id);
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));

        // You may want to add a check here to see if the user is a team leader of an assigned team
        if (!isCreator && !isAssigned && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.status = status || task.status;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.teams = teams !== undefined ? teams : task.teams;
        
        // Update the private status
        task.isPrivate = !task.assignedTo?.length && !task.teams?.length;

        const updatedTask = await task.save();
        // Add advanced notification logic here for updates if needed
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// delete a task
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization: Only creator or admin can delete
        const isCreator = task.createdBy.equals(req.user._id);
        if (!isCreator && req.user.role !== 'admin') {
            // Also allow team leaders to delete tasks assigned to their teams
            const userIsTeamLeaderOfAssignedTeam = await Team.exists({
                _id: { $in: task.teams },
                leader: req.user._id,
            });
            if (!userIsTeamLeaderOfAssignedTeam) {
                 return res.status(403).json({ message: 'Not authorized to delete this task' });
            }
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;