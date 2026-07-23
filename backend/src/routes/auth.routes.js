const express = require('express');
const router = express.Router();

const {
    register,
    login,
    verifyOtp,
    me,
    offices,
    updateProfile,
    updatePassword,
    getTechnicians
} = require('../controllers/authController');

const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

router.get('/me', requireAuth, me);

router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, updatePassword);

router.get('/offices', offices);

// NUEVA RUTA
router.get('/technicians', requireAuth, getTechnicians);

module.exports = router;