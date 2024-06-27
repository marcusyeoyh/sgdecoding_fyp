
const router = require('express').Router();

const { 
	login,
	register,
	forgotPassword,
	changePassword,
	resetPassword
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;