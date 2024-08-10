const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controller/chatController');

// Route to send a new message
router.post('/send', sendMessage);

// Route to get messages between two users
router.get('/messages', getMessages);

module.exports = router;
