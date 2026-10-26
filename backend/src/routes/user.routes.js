const express = require('express');
const router = express.Router();
const { listUsers, updateUser, createUser } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);

module.exports = router;
