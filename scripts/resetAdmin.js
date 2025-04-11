const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const resetAdmin = async () => {
    try {
        // Delete existing admin
        await User.deleteOne({ email: 'admin@admin.com' });
        console.log('Existing admin deleted');

        // Create new admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin123',
            isAdmin: true,
            phone: '+1234567890'
        });

        console.log('New admin user created successfully:');
        console.log('Email:', admin.email);
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
};

resetAdmin(); 