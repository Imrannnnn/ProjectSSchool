const express = require('express');
const router = express.Router();
const { 
    getStudents, 
    assignSupervisor, 
    getMe, 
    getAdminStats,
    createRangeAssignment,
    getRangeAssignments,
    deleteRangeAssignment
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/students', protect, adminOnly, getStudents);
router.post('/assign-supervisor', protect, adminOnly, assignSupervisor);
router.get('/ranges', protect, adminOnly, getRangeAssignments);
router.post('/ranges', protect, adminOnly, createRangeAssignment);
router.delete('/ranges/:id', protect, adminOnly, deleteRangeAssignment);

module.exports = router;
