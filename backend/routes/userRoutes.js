const express = require('express');
const router = express.Router();
const { getStudents, assignSupervisor, getMe, getAdminStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/students', protect, adminOnly, getStudents);
router.post('/assign-supervisor', protect, adminOnly, assignSupervisor);

module.exports = router;
