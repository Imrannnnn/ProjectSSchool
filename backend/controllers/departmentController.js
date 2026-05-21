const DepartmentConfig = require('../models/DepartmentConfig');

// Get all department configurations
const getDepartments = async (req, res) => {
    try {
        const departments = await DepartmentConfig.find();
        
        // Auto-initialize if empty
        if (departments.length === 0) {
            const defaultDepts = [
                { name: 'SWD', prefix: 'HND II/swd/', capacity: 100 },
                { name: 'NCC', prefix: 'HND II/NCC/', capacity: 100 },
                { name: 'CS', prefix: 'ND II/CS/', capacity: 100 }
            ];
            await DepartmentConfig.insertMany(defaultDepts);
            return res.json(defaultDepts);
        }
        
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update department capacity
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity } = req.body;
        
        const dept = await DepartmentConfig.findByIdAndUpdate(
            id,
            { capacity },
            { new: true, runValidators: true }
        );
        
        if (!dept) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json(dept);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getDepartments,
    updateDepartment
};
