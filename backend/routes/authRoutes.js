const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshToken, getSupervisors } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);
router.get('/supervisors', getSupervisors);

module.exports = router;
