const express = require('express');
const router = express.Router();

const {
    register,
    login,
    startGoogleLogin,
    googleCallback,
    me,
    offices,
    updateProfile,
    updatePassword,
    getTechnicians
} = require('../controllers/authController');

const { requireAuth } = require('../middleware/auth');

router.get('/google', startGoogleLogin);
router.get('/google/callback', googleCallback);

router.get('/me', requireAuth, me);

router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, updatePassword);

router.get('/offices', offices);

// NUEVA RUTA
router.get('/technicians', requireAuth, getTechnicians);

module.exports = router;
