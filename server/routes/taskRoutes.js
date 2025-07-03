const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Notification = require('../models/Notifications');

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
        .populate('assignedTo', 'name email')
        .populate('team', 'name')
        .populate('createdBy', 'name email');

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
            title, description, deadline, assignedTo: assignedTo || [], team, createdBy: req.user._id,
        });
        const createdTask = await task.save();

        // --- Notification Logic for New Task ---
        if (createdTask.assignedTo && createdTask.assignedTo.length > 0) {
            for (const assigneeId of createdTask.assignedTo) {
                // Don't send notification to self if assigned to self
                if (assigneeId.toString() === req.user._id.toString()) continue;

                const notification = new Notification({
                    recipient: assigneeId,
                    sender: req.user._id,
                    type: 'task_assigned',
                    message: `Task "${createdTask.title}" has been assigned to you by ${req.user.name}.`,
                    taskId: createdTask._id,
                });
                await notification.save();
                // Emit real-time notification via Socket.IO
                req.io.to(assigneeId.toString()).emit('newNotification', notification);
            }
        }
        // --- End Notification Logic ---

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
            .populate('team', 'name')
            .populate('createdBy', 'name email');

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
        if (!task) { return res.status(404).json({ message: 'Task not found' }); }

        // Store old status and assignedTo for comparison
        const oldStatus = task.status;
        const oldAssignedTo = task.assignedTo.map(id => id.toString());

        // Update task fields
        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        task.status = status || task.status;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.team = team !== undefined ? team : task.team;

        const updatedTask = await task.save();

        // --- Notification Logic for Task Update ---
        // 1. Status Change Notification
        if (oldStatus !== updatedTask.status) {
            const message = updatedTask.status === 'completed'
                ? `Task "${updatedTask.title}" has been marked as COMPLETED by ${req.user.name}.`
                : `Task "${updatedTask.title}" status changed to "${updatedTask.status}" by ${req.user.name}.`;

            // Notify creator and assigned users (excluding current user)
            const recipients = new Set([updatedTask.createdBy.toString(), ...updatedTask.assignedTo.map(id => id.toString())]);
            recipients.delete(req.user._id.toString()); // Don't notify self

            for (const recipientId of recipients) {
                const notification = new Notification({
                    recipient: recipientId,
                    sender: req.user._id,
                    type: 'task_updated',
                    message,
                    taskId: updatedTask._id,
                });
                await notification.save();
                req.io.to(recipientId).emit('newNotification', notification);
            }
        }

        // 2. Assignment Change Notification
        const newAssignedTo = updatedTask.assignedTo.map(id => id.toString());
        const newlyAssigned = newAssignedTo.filter(id => !oldAssignedTo.includes(id));
        const unassigned = oldAssignedTo.filter(id => !newAssignedTo.includes(id));

        for (const userId of newlyAssigned) {
            if (userId === req.user._id.toString()) continue; // Skip self
            const notification = new Notification({
                recipient: userId,
                sender: req.user._id,
                type: 'task_assigned',
                message: `You have been assigned to task "${updatedTask.title}" by ${req.user.name}.`,
                taskId: updatedTask._id,
            });
            await notification.save();
            req.io.to(userId).emit('newNotification', notification);
        }

        for (const userId of unassigned) {
            if (userId === req.user._id.toString()) continue; // Skip self
            const notification = new Notification({
                recipient: userId,
                sender: req.user._id,
                type: 'task_updated', // Or 'task_unassigned' if you add that type
                message: `You have been unassigned from task "${updatedTask.title}" by ${req.user.name}.`,
                taskId: updatedTask._id,
            });
            await notification.save();
            req.io.to(userId).emit('newNotification', notification);
        }
        // --- End Notification Logic ---

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