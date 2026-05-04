const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-project-management');
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

const seedData = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ role: 'admin' });

        if (!existingAdmin) {
            await User.create({
                role: 'admin',
                identifier: 'admin',
                name: 'System Admin',
                password: 'password'
            });
            console.log('Admin user created (Identifier: admin, Password: password)');
        }



        console.log('Data Seeding Completed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

seedData();
