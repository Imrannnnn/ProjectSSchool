const User = require('../models/User');

const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('supervisor', 'name identifier');
        res.json(students);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const supervisorCount = await User.countDocuments({ role: 'supervisor' });
        const unassignedStudents = await User.countDocuments({ role: 'student', supervisor: { $exists: false } });
        const approvedProjects = await User.countDocuments({ topicStatus: 'approved' });
        
        const supervisors = await User.find({ role: 'supervisor' }).select('name identifier');
        const supervisorStats = await Promise.all(supervisors.map(async (sup) => {
            const studentCount = await User.countDocuments({ supervisor: sup._id });
            const approvedCount = await User.countDocuments({ supervisor: sup._id, topicStatus: 'approved' });
            return {
                _id: sup._id,
                name: sup.name,
                identifier: sup.identifier,
                studentCount,
                approvedCount
            };
        }));

        res.json({
            totals: {
                students: studentCount,
                supervisors: supervisorCount,
                unassignedStudents,
                approvedProjects
            },
            supervisorStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('supervisor', 'name identifier');
        res.json(user);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

const assignSupervisor = async (req, res) => {
    try {
        const { supervisorId, studentIds } = req.body;
        if (!supervisorId || !studentIds || !Array.isArray(studentIds)) {
             return res.status(400).json({ message: 'Invalid assignment data' });
        }
        
        await User.updateMany(
            { _id: { $in: studentIds }, role: 'student' },
            { $set: { supervisor: supervisorId } }
        );
        
        req.sendNotification(supervisorId, 'student_assigned', { count: studentIds.length });
        studentIds.forEach(studentId => {
            req.sendNotification(studentId, 'supervisor_assigned', { supervisorId });
        });
        
        res.json({ message: 'Students successfully assigned', count: studentIds.length });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getStudents, assignSupervisor, getMe, getAdminStats };
