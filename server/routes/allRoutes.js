const express = require('express');
const router = express.Router();
const usersRoutes = require('./usersRoutes');
const chatRoutes = require('./chatRoutes');

router.use('/user', usersRoutes);
router.use('/chat', chatRoutes);

module.exports = router;