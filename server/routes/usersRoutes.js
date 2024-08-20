const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById } = require('../controller/userController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');

// User Registration and Login
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

// Get Users
router.get('/users', getAllUsers);
router.get('/user/:id', getUserById);

module.exports = router;
