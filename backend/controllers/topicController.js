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

        // Removed duplicate check on student phase as requested
        
        const user = await User.findById(req.user._id);
        user.proposedTopics = proposedTopics;
        user.topicStatus = 'pending';
        user.topicSubmittedAt = new Date();
        // user.lastDuplicationCheckAt = new Date(); // Stopped tracking here
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
        
        student.topicReviewedAt = new Date();
        // student.lastDuplicationCheckAt = new Date(); // Stopped tracking here
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
            const approvedStudents = await User.find({
                _id: { $ne: student._id },
                topicStatus: 'approved',
                role: 'student'
            });

            const duplicate = approvedStudents.find(approvedStudent => 
                approvedStudent.approvedTopic?.title &&
                areDuplicates(approvedStudent.approvedTopic.title, student.approvedTopic.title)
            );

            if (duplicate) {
                return res.status(400).json({ message: `This topic is too similar to an already approved project "${duplicate.approvedTopic.title}".` });
            }
        }

        student.topicStatus = status;
        if (status === 'approved') {
            student.topicApprovedAt = new Date();
        }
        
        student.lastDuplicationCheckAt = new Date();
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

const batchDuplicateCheck = async (req, res) => {
    try {
        // Fetch all approved students
        const approvedStudents = await User.find({ topicStatus: 'approved', role: 'student' });
        
        // Sort approved students by approved date (earliest first) to keep the first approved one
        const getApprovalTime = (s) => {
            if (s.topicApprovedAt) return new Date(s.topicApprovedAt).getTime();
            if (s.topicReviewedAt) return new Date(s.topicReviewedAt).getTime();
            if (s.topicSubmittedAt) return new Date(s.topicSubmittedAt).getTime();
            return new Date(s.createdAt || 0).getTime();
        };
        approvedStudents.sort((a, b) => getApprovalTime(a) - getApprovalTime(b));

        const keptApprovedStudents = [];
        let approvedRejectedCount = 0;

        // Clean up any duplicates within already approved projects
        for (const student of approvedStudents) {
            if (!student.approvedTopic?.title) continue;

            const duplicateOf = keptApprovedStudents.find(kept => 
                areDuplicates(kept.approvedTopic.title, student.approvedTopic.title)
            );

            if (duplicateOf) {
                student.topicStatus = 'correction';
                student.supervisorFeedback = `Topic rejected: This topic is a duplicate of an already approved project (${duplicateOf.approvedTopic.title}) in our database.`;
                student.lastDuplicationCheckAt = new Date();
                await student.save();
                
                // Send notifications
                req.sendNotification(student._id, 'project_status_updated', student);
                if (student.supervisor) {
                    req.sendNotification(student.supervisor, 'project_status_updated', student);
                }
                
                approvedRejectedCount++;
            } else {
                keptApprovedStudents.push(student);
            }
        }

        // Now check pending students in queue
        const pendingStudents = await User.find({ topicStatus: 'approved_by_supervisor', role: 'student' });
        
        let rejectedCount = 0;
        let approvedCount = 0;
        
        for (const student of pendingStudents) {
            if (!student.approvedTopic?.title) continue;
            
            // Check against kept approved topics
            const duplicateOf = keptApprovedStudents.find(kept => 
                areDuplicates(kept.approvedTopic.title, student.approvedTopic.title)
            );
            
            if (duplicateOf) {
                student.topicStatus = 'correction';
                student.supervisorFeedback = `Topic rejected: This topic is a duplicate of an already approved project (${duplicateOf.approvedTopic.title}) in our database.`;
                rejectedCount++;
            } else {
                student.topicStatus = 'approved';
                student.topicApprovedAt = new Date();
                approvedCount++;
                keptApprovedStudents.push(student); // Add to keptApprovedStudents so subsequent checks in this batch see it
            }
            
            student.lastDuplicationCheckAt = new Date();
            await student.save();
            
            // Send notifications
            req.sendNotification(student._id, 'project_status_updated', student);
            if (student.supervisor) {
                req.sendNotification(student.supervisor, 'project_status_updated', student);
            }
        }
        
        let message = `Batch check complete. ${approvedCount} topics automatically approved, ${rejectedCount} topics rejected due to duplication.`;
        if (approvedRejectedCount > 0) {
            message += ` Also resolved ${approvedRejectedCount} pre-existing duplicate approved topic(s) by keeping the first approved and rejecting the rest.`;
        }

        res.json({ 
            message,
            approvedCount,
            rejectedCount,
            approvedRejectedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitProject: submitTopics,
    getMyProject: getMyTopic,
    getAssignedProjects: getAssignedStudents,
    reviewProject: reviewTopic,
    getAdminQueue,
    adminApproval,
    getApprovedProjects: getApprovedTopics,
    deleteMyProject: deleteMyTopic,
    batchDuplicateCheck
};
