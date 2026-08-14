const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Send OTP route
router.post('/send-otp', authController.sendOtp);

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
