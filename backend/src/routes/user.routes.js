const express = require('express');
const router = express.Router();
const { listUsers, updateUser } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));
router.get('/', listUsers);
router.patch('/:id', updateUser);

module.exports = router;
