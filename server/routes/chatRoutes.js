const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsSeen, getUsersWithLastMessage } = require('../controller/chatController');

// Route to send a new message
router.post('/send', sendMessage);

// Route to get messages between two users
router.get('/messages/:userId/:contactId', getMessages);

// Route to mark messages as seen
router.post('/mark-seen', markAsSeen);

// Route to get users with their last message and unseen count
router.get('/users', getUsersWithLastMessage);

module.exports = router;
