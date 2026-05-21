const User = require('../models/User');
const RangeAssignment = require('../models/RangeAssignment');
const { extractNumber, getPrefix } = require('../utils/rangeHelper');

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
        
        const DepartmentConfig = require('../models/DepartmentConfig');
        const departments = await DepartmentConfig.find();
        
        const departmentStats = await Promise.all(departments.map(async (dept) => {
            const registeredCount = await User.countDocuments({ role: 'student', identifier: { $regex: '^' + dept.prefix } });
            const assignedCount = await User.countDocuments({ role: 'student', identifier: { $regex: '^' + dept.prefix }, supervisor: { $exists: true } });
            const submittedCount = await User.countDocuments({ role: 'student', identifier: { $regex: '^' + dept.prefix }, "proposedTopics.0": { $exists: true } });
            const notSubmittedCount = await User.countDocuments({ role: 'student', identifier: { $regex: '^' + dept.prefix }, "proposedTopics.0": { $exists: false } });
            return {
                _id: dept._id,
                name: dept.name,
                prefix: dept.prefix,
                capacity: dept.capacity,
                studentCount: registeredCount,
                registeredCount,
                assignedCount,
                submittedCount,
                notSubmittedCount
            };
        }));
        
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
            departmentStats,
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

const createRangeAssignment = async (req, res) => {
    try {
        const { supervisorId, startIdentifier, endIdentifier } = req.body;
        if (!supervisorId || !startIdentifier || !endIdentifier) {
            return res.status(400).json({ message: 'Missing range data' });
        }

        const startNum = extractNumber(startIdentifier);
        const endNum = extractNumber(endIdentifier);
        const prefix = getPrefix(startIdentifier);

        const range = await RangeAssignment.create({
            supervisor: supervisorId,
            startIdentifier,
            endIdentifier,
            prefix,
            startNum,
            endNum
        });

        // Also assign existing students who fall into this range and are unassigned
        const unassignedStudents = await User.find({ role: 'student', supervisor: { $exists: false } });
        const studentsToAssign = unassignedStudents.filter(s => {
            const sNum = extractNumber(s.identifier);
            const sPrefix = getPrefix(s.identifier);
            if (prefix && sPrefix !== prefix) return false;
            return sNum !== null && sNum >= startNum && sNum <= endNum;
        });

        if (studentsToAssign.length > 0) {
            await User.updateMany(
                { _id: { $in: studentsToAssign.map(s => s._id) } },
                { $set: { supervisor: supervisorId } }
            );
        }

        res.status(201).json({ message: 'Range assignment created', range, assignedExistingCount: studentsToAssign.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRangeAssignments = async (req, res) => {
    try {
        const ranges = await RangeAssignment.find().populate('supervisor', 'name identifier');
        res.json(ranges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteRangeAssignment = async (req, res) => {
    try {
        await RangeAssignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Range assignment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { academicSession } = req.body;
        const user = await User.findById(req.user._id);
        
        if (academicSession) {
            user.academicSession = academicSession;
        }
        
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { 
    getStudents, 
    assignSupervisor, 
    getMe, 
    updateProfile,
    getAdminStats, 
    createRangeAssignment, 
    getRangeAssignments, 
    deleteRangeAssignment 
};
