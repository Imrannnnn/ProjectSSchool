const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-project-management')
    .then(async () => {
        const users = await User.find({}).populate('supervisor', 'name identifier');
        console.log('--- ALL Users Status ---');
        users.forEach(u => {
            console.log(`User: ${u.name} | Identifier: ${u.identifier} | Role: ${u.role} | Supervisor: ${u.supervisor ? u.supervisor.name : 'UNASSIGNED'}`);
        });
        process.exit();
    });
