const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsSeen } = require('../controller/chatController');

// Route to send a new message
router.post('/send', sendMessage);

// Route to get messages between two users
router.get('/messages/:userId/:contactId', getMessages);

router.post('/mark-seen', markAsSeen);

module.exports = router;
