const mongoose = require('mongoose');

const departmentConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['SWD', 'NCC', 'CS']
    },
    prefix: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('DepartmentConfig', departmentConfigSchema);
