const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const resetProducts = async () => {
    try {
        // Delete all existing products
        await Product.deleteMany({});
        console.log('All products have been deleted successfully');
        
        // Disconnect from database
        await mongoose.disconnect();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetProducts(); 