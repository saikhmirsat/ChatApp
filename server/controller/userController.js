const User = require('../model/user'); // Adjust the path as needed
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
        const existingUser = await User.findOne({ $or: [{ userName }, { phone }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this username, phone, or email.' });
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

        res.status(201).json({ message: 'User registered successfully!',user:newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrUsername, password } = req.body;

    try {
        // Find the user by either email or username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { userName: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email/username or password.' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email/username or password.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, userName: user.userName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Login successful!', token,user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};


// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};
