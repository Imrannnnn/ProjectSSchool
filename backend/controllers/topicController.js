const User = require('../models/User');
const { areDuplicates } = require('../utils/topicEngine');

const submitTopics = async (req, res) => {
    try {
        const { proposedTopics } = req.body;
        
        if (!req.user.supervisor) {
             return res.status(400).json({ message: 'UNASSIGNED: You have not been assigned a supervisor yet.' });
        }

        if (!proposedTopics || proposedTopics.length < 2) {
             return res.status(400).json({ message: 'You must propose at least two topics.' });
        }

        // Check for duplicates within the submission itself
        const titles = proposedTopics.map(t => t.title);
        const internalDuplicate = titles.some((title, index) => 
            titles.findIndex(t => areDuplicates(t, title)) !== index
        );
        if (internalDuplicate) {
            return res.status(400).json({ message: 'Duplicate topics found in your proposal.' });
        }

        // Check against already approved topics in the system
        const approvedUsers = await User.find({ 
            'approvedTopic.title': { $exists: true },
            topicStatus: 'approved'
        }).select('approvedTopic.title');

        for (const topic of proposedTopics) {
            const isTaken = approvedUsers.some(u => areDuplicates(u.approvedTopic.title, topic.title));
            if (isTaken) {
                return res.status(400).json({ 
                    message: `The topic "${topic.title}" has already been approved for another student. Please choose a different topic.` 
                });
            }
        }
        
        const user = await User.findById(req.user._id);
        user.proposedTopics = proposedTopics;
        user.topicStatus = 'pending';
        await user.save();
        
        req.sendNotification(user.supervisor, 'project_submitted', user);
        
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyTopic = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('supervisor', 'name identifier');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAssignedStudents = async (req, res) => {
    try {
        const students = await User.find({ supervisor: req.user._id, role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reviewTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, selectedTopicIndex, comment } = req.body;
        
        const student = await User.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        student.topicStatus = status;
        if (comment) student.supervisorFeedback = comment;
        
        if (status === 'approved_by_supervisor') {
            if (selectedTopicIndex !== undefined && student.proposedTopics[selectedTopicIndex]) {
                const selected = student.proposedTopics[selectedTopicIndex];
                
                // Final check before supervisor approval
                const alreadyApproved = await User.findOne({
                    _id: { $ne: student._id },
                    'approvedTopic.title': selected.title, // Simple check first
                    topicStatus: 'approved'
                });

                if (alreadyApproved) {
                    return res.status(400).json({ message: 'This topic has already been approved for another student.' });
                }

                student.approvedTopic = {
                    title: selected.title,
                    description: selected.description
                };
            }
            
            const admins = await User.find({ role: 'admin' });
            admins.forEach(admin => {
                  req.sendNotification(admin._id, 'new_admin_review', student);
            });
        }
        
        await student.save();
        req.sendNotification(student._id, 'project_status_updated', student);
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminQueue = async (req, res) => {
    try {
        const students = await User.find({ topicStatus: { $in: ['approved_by_supervisor', 'approved'] }, role: 'student' });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getApprovedTopics = async (req, res) => {
    try {
        const { letter, page = 1, limit = 10 } = req.query;
        let query = { topicStatus: 'approved', role: 'student' };
        
        if (letter && letter !== 'All') {
            query['approvedTopic.title'] = new RegExp(`^${letter}`, 'i');
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const students = await User.find(query)
            .sort({ 'approvedTopic.title': 1 })
            .skip(skip)
            .limit(limitNum);
            
        const total = await User.countDocuments(query);
        
        res.json({
            projects: students.map(s => ({
                _id: s._id,
                student: { name: s.name, identifier: s.identifier },
                title: s.approvedTopic.title,
                description: s.approvedTopic.description
            })),
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const adminApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const student = await User.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        if (status === 'approved' && student.approvedTopic) {
            const duplicate = await User.findOne({
                _id: { $ne: student._id },
                'approvedTopic.title': student.approvedTopic.title,
                topicStatus: 'approved'
            });

            if (duplicate) {
                return res.status(400).json({ message: 'This topic has already been finalized for another student.' });
            }
        }

        student.topicStatus = status;
        
        await student.save();
        req.sendNotification(student._id, 'project_status_updated', student);
        req.sendNotification(student.supervisor, 'project_status_updated', student);
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMyTopic = async (req, res) => {
    try {
        const student = await User.findById(req.user._id);
        if (student.topicStatus === 'approved') {
            return res.status(400).json({ message: 'Approved topics cannot be cleared' });
        }
        student.proposedTopics = [];
        student.approvedTopic = undefined;
        student.topicStatus = 'none';
        await student.save();
        res.json({ message: 'Topics cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    submitProject: submitTopics,
    getMyProject: getMyTopic,
    getAssignedProjects: getAssignedStudents,
    reviewProject: reviewTopic,
    getAdminQueue,
    adminApproval,
    getApprovedProjects: getApprovedTopics,
    deleteMyProject: deleteMyTopic
};
