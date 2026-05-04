const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    lastActivity: {
        type: Date,
        default: Date.now,
        index: { expires: '2h' } // Automatically clean up session after 2 hours of inactivity
    },
    userAgent: String,
    ipAddress: String,
    isValid: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Explicit index for user's active sessions
sessionSchema.index({ userId: 1, isValid: 1 });

module.exports = mongoose.model('Session', sessionSchema);
