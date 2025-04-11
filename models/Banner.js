const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    position: {
        type: String,
        required: true,
        enum: ['main', 'category', 'product', 'promo']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    priority: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['promotion', 'new', 'popular', 'custom']
    },
    backgroundColor: {
        type: String
    },
    textColor: {
        type: String
    },
    buttonText: {
        type: String
    },
    buttonColor: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
bannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Banner', bannerSchema); 