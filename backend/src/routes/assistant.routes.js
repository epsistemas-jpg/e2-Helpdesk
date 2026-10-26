const express = require('express');
const { askAssistant } = require('../controllers/assistantController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.post('/chat', askAssistant);

module.exports = router;
