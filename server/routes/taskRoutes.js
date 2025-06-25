const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Task = require('../models/Task');

// get all tasks for the authenticated user or their teams
router.get('/', protect, async (req, res) => {
    try {
        // find tasks assigned to the user, or tasks belonging to teams the user is a member of
        const tasks = await Task.find({
            $or: [
                { assignedTo: req.user._id },
                { team: { $in: req.user.teams } }
            ]
        })
        .populate('assignedTo', 'username email')
        .populate('team', 'name')
        .populate('createdBy', 'username email');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// create a new task
router.post('/', protect, async (req, res) => {
    const { title, description, deadline, assignedTo, team } = req.body;
    try {
        const task = new Task({
            title,
            description,
            deadline,
            assignedTo: assignedTo || [],
            team,
            createdBy: req.user._id,
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// get a single task by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'username email')
            .populate('team', 'name')
            .populate('createdBy', 'username email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Basic authorization: ensure user is involved with the task or its team
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        const isCreator = task.createdBy.equals(req.user._id);
        const isTeamMember = req.user.teams.some(teamId => task.team && teamId.equals(task.team._id));

        if (isAssigned || isCreator || isTeamMember) {
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
    const { title, description, deadline, status, assignedTo, team } = req.body;
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Basic authorization: Only creator or team member can update
        const isCreator = task.createdBy.equals(req.user._id);
        const isTeamMember = req.user.teams.some(teamId => task.team && teamId.equals(task.team._id));

        if (!isCreator && !isTeamMember) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.status = status || task.status;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.team = team !== undefined ? team : task.team;

        const updatedTask = await task.save();
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

        // Authorization: Only creator or team owner can delete
        const isCreator = task.createdBy.equals(req.user._id);
        if (!isCreator) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;