const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // token expires in 1 hr
};

// register user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    if (!validator.isStrongPassword(password, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    })) {
        return res.status(400).json({
            message: 'Password is not strong enough. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        });
    }
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;