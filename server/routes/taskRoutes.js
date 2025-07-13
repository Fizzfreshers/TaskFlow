const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Notification = require('../models/Notifications');

// get all tasks for the authenticated user or their teams
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { assignedTo: req.user._id },
                { teams: { $in: req.user.teams } } // find tasks in any of the user's teams
            ]
        })
        .populate('assignedTo', 'name email')
        .populate('teams', 'name') // populate the array of teams
        .populate('createdBy', 'name email');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// create a new task
router.post('/', protect, async (req, res) => {
    const { title, description, deadline, assignedTo, teams } = req.body;
    try {
        const task = new Task({
            title, description, deadline, assignedTo: assignedTo || [], teams: teams || [], createdBy: req.user._id,
        });
        const createdTask = await task.save();

        const recipients = new Set(createdTask.assignedTo.map(id => id.toString()));
        // add all members of all assigned teams to recipients
        if (createdTask.teams && createdTask.teams.length > 0) {
            const teamsWithMembers = await mongoose.model('Team').find({ '_id': { $in: createdTask.teams } }).select('members');
            teamsWithMembers.forEach(team => {
                team.members.forEach(memberId => recipients.add(memberId.toString()));
            });
        }
        
        recipients.delete(req.user._id.toString()); // avoid self-notify

        for (const recipientId of recipients) {
            const notification = new Notification({
                recipient: recipientId,
                sender: req.user._id,
                type: 'task_assigned',
                message: `You have been assigned to a new task: "${createdTask.title}" by ${req.user.name}.`,
                taskId: createdTask._id,
            });
            await notification.save();
            req.io.to(recipientId).emit('newNotification', notification);
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

        if (!isCreator && !isAssigned && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.status = status || task.status;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.teams = teams !== undefined ? teams : task.teams;

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
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;