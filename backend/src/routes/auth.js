const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Send OTP route (Old)
router.post('/send-otp', authController.sendOtp);

// Mitra Registration
router.post('/mitra/register', authController.mitraRegister);

// Send Magic Link route
router.post('/send-magic-link', authController.sendMagicLink);

// Verify Magic Link route
router.post('/verify-magic-link', authController.verifyMagicLink);

// Login route
router.post('/login', authController.login);

// Google Auth route
router.post('/google', authController.googleAuth);

// Update location route
router.put('/location', authController.updateLocation);

// Update profile route
router.put('/profile', authController.updateProfile);

// Update/Delete profile picture
router.put('/profile/picture', authController.uploadProfilePicture);
router.delete('/profile/picture', authController.deleteProfilePicture);

module.exports = router;
