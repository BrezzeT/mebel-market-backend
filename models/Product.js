const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['chairs', 'sofas', 'beds', 'poufs', 'tables']
    },
    subcategory: {
        type: String,
        required: true,
        enum: [
            // Chairs
            'bar', 'dining', 'office',
            
            // Sofas
            'corner', 'straight', 'modular', 'folding', 'armchairs',
            
            // Beds
            'single', 'double', 'kids', 'sofa_bed',
            
            // Poufs
            'with_storage', 'without_storage', 'bench', 'ottoman',
            
            // Tables
            'dining', 'coffee', 'computer', 'console'
        ]
    },
    materials: {
        type: [String],
        validate: {
            validator: function(v) {
                const validMaterials = [
                    'wooden', 'metal', 'soft', 'withArmrests', // chairs
                    'leather', 'velvet', 'textile', 'eco_leather', // sofas and poufs
                    'glass', 'marble' // tables
                ];
                return Array.isArray(v) && v.every(material => validMaterials.includes(material));
            },
            message: 'Неверный формат материалов'
        }
    },
    price: {
        type: Number,
        required: true
    },
    monthlyPayment: {
        type: Number,
        required: false
    },
    images: [{
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    dimensions: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        depth: {
            type: Number,
            required: true
        }
    },
    isNew: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    specifications: [{
        name: String,
        value: String
    }],
    inStock: {
        type: Boolean,
        default: true
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
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema); 