const express = require('express');
const router = express.Router();
const {
    submitProject,
    getMyProject,
    getAssignedProjects,
    reviewProject,
    getAdminQueue,
    adminApproval,
    getApprovedProjects,
    deleteMyProject,
    batchDuplicateCheck
} = require('../controllers/topicController');
const { protect, superVisorOnly, adminOnly } = require('../middleware/auth');

router.get('/approved', protect, getApprovedProjects);

router.route('/')
    .post(protect, submitProject)
    .get(protect, getMyProject)
    .delete(protect, deleteMyProject);

router.get('/assigned', protect, superVisorOnly, getAssignedProjects);
router.put('/:id/review', protect, superVisorOnly, reviewProject); // Also accessible to admin if needed, but handled in controller

router.get('/admin/queue', protect, adminOnly, getAdminQueue);
router.post('/admin/batch-check', protect, adminOnly, batchDuplicateCheck);
router.put('/:id/admin-approval', protect, adminOnly, adminApproval);

// Feedback route removed as Project model was deprecated


module.exports = router;
