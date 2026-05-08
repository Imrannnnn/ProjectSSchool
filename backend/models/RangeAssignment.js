const mongoose = require('mongoose');

const rangeAssignmentSchema = new mongoose.Schema({
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startIdentifier: {
        type: String,
        required: true
    },
    endIdentifier: {
        type: String,
        required: true
    },
    prefix: {
        type: String
    },
    startNum: {
        type: Number
    },
    endNum: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('RangeAssignment', rangeAssignmentSchema);
