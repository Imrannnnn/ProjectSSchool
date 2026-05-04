const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        const adminPassword = 'password123';

        const existingAdmin = await User.findOne({ identifier: 'admin' });

        if (!existingAdmin) {
            await User.create({
                role: 'admin',
                identifier: 'admin',
                name: 'System Admin',
                password: adminPassword // The model will hash this automatically
            });
            console.log('Admin user created (Identifier: admin, Password: ' + adminPassword + ')');
        } else {
            // Update password - the pre-save hook in User.js will re-hash it
            existingAdmin.password = adminPassword;
            await existingAdmin.save();
            console.log('Admin password updated');
        }

        console.log('Data Seeding Completed!');
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();