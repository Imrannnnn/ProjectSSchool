const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        const user = await User.findOne({ identifier: 'admin' });
        if (!user) {
            console.log('Admin user NOT FOUND in database.');
            process.exit(1);
        }
        
        console.log('Admin user found. Role:', user.role);
        
        const isMatch = await user.matchPassword('password123');
        console.log('Does password123 match?', isMatch);
        
        if (!isMatch) {
            console.log('Hashing password123 manually to see if it matches...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('password123', salt);
            console.log('New hash would be:', hash);
            console.log('Current DB hash is:', user.password);
        }
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
