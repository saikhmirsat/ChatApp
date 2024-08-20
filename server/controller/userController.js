const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register User
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userName, nickName, phone, email, dateOfBirth, gender, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ userName }, { phone }, { email }]
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this username, phone, or email.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userName,
            nickName,
            phone,
            email,
            dateOfBirth,
            gender,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, userName: newUser.userName }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: newUser._id,
                userName: newUser.userName,
                nickName: newUser.nickName,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { emailOrUsername, password } = req.body;

    console.log(emailOrUsername,password)

    try {
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { userName: emailOrUsername }]
        });
        
        console.log(user)

        if (!user) {
            return res.status(400).json({ message: 'Invalid email/username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email/username or password.' });
        }

        const token = jwt.sign(
            { id: user._id, userName: user.userName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Mark user as online
        user.isOnline = true;
        user.lastActive = new Date();
        await user.save();

        res.status(200).json({ message: 'Login successful!', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Logout User (new functionality)
exports.logoutUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.isOnline = false;
        user.lastActive = new Date();
        await user.save();

        res.status(200).json({ message: 'User logged out successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get User by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};
