const express = require('express');
const router = express.Router();
const { getSessions, createSession, deleteSession } = require('../controllers/academicSessionController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSessions); // Public for registration
router.post('/', protect, adminOnly, createSession);
router.delete('/:id', protect, adminOnly, deleteSession);

module.exports = router;
