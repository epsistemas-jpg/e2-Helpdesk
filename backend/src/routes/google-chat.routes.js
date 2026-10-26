const express = require('express');
const { googleChatEvent } = require('../controllers/googleChatController');

const router = express.Router();
router.post('/events', googleChatEvent);

module.exports = router;
