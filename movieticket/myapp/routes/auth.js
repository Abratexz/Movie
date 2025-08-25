const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Page routes
router.get('/login',    authController.showLoginForm);
router.post('/login',   authController.login);
router.get('/register', authController.showRegisterForm);
router.post('/register',authController.register);
router.get('/forgot',   authController.showForgotPasswordForm);
router.post('/forgot',  authController.sendResetLink);
router.get('/forgot', authController.showForgotPasswordForm);
router.post('/forgot', authController.sendResetLink);
router.get('/reset/:token', authController.showResetPasswordForm);
router.post('/reset/:token', authController.resetPassword);
router.get('/logout',   authController.logout);

module.exports = router;
