const AcademicSession = require('../models/AcademicSession');

// @desc    Get all academic sessions
// @route   GET /api/academic-sessions
// @access  Public (so students can select during registration)
exports.getSessions = async (req, res) => {
    try {
        const sessions = await AcademicSession.find({ isActive: true }).sort({ name: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create an academic session
// @route   POST /api/academic-sessions
// @access  Private/Admin
exports.createSession = async (req, res) => {
    const { name } = req.body;
    try {
        const sessionExists = await AcademicSession.findOne({ name });
        if (sessionExists) {
            return res.status(400).json({ message: 'Session already exists' });
        }
        const session = await AcademicSession.create({ name });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete an academic session
// @route   DELETE /api/academic-sessions/:id
// @access  Private/Admin
exports.deleteSession = async (req, res) => {
    try {
        const session = await AcademicSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        await session.deleteOne();
        res.json({ message: 'Session removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
