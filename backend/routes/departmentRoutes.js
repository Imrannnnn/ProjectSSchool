const express = require('express');
const router = express.Router();
const { getDepartments, updateDepartment } = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getDepartments); // Can be accessed by any user for registration dropdowns or protected, let's keep it open or protect it. Registration needs it? Let's just make it public.
router.put('/:id', protect, adminOnly, updateDepartment);

module.exports = router;
