const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['student', 'supervisor', 'admin'],
        required: true
    },
    identifier: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // points to a supervisor
    },
    proposedTopics: [{
        title: { type: String },
        description: { type: String },
        isRejectedByAdmin: { type: Boolean, default: false }
    }],
    approvedTopic: {
        title: String,
        description: String
    },
    topicStatus: {
        type: String,
        enum: ['none', 'pending', 'approved_by_supervisor', 'approved', 'correction'],
        default: 'none'
    },
    supervisorFeedback: String
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
