const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, subcategory, material, isNew, isPopular, search, sort, limit } = req.query;
    
    let query = {};
    
    if (category) {
        query.category = category;
    }
    
    if (subcategory) {
        query.subcategory = subcategory;
    }

    if (material) {
        query.material = material;
    }
    
    if (isNew === 'true') {
        query.isNew = true;
    }
    
    if (isPopular === 'true') {
        query.isPopular = true;
    }
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    let sortOptions = {};
    if (sort) {
        switch (sort) {
            case 'price_asc':
                sortOptions.price = 1;
                break;
            case 'price_desc':
                sortOptions.price = -1;
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }
    }

    try {
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(limit ? parseInt(limit) : 0);
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500);
        throw new Error('Ошибка при получении товаров');
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Товар не найден');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    try {
        console.log('Received product data:', req.body);
        console.log('Received files:', req.files);

        const productData = { ...req.body };

        // Обработка материалов
        if (productData.materials) {
            try {
                productData.materials = JSON.parse(productData.materials);
                if (!Array.isArray(productData.materials)) {
                    throw new Error('Материалы должны быть массивом');
                }
            } catch (e) {
                console.error('Materials parsing error:', e);
                throw new Error('Неверный формат материалов');
            }
        }

        // Обработка размеров
        if (productData.dimensions) {
            try {
                productData.dimensions = JSON.parse(productData.dimensions);
                if (!productData.dimensions.width || !productData.dimensions.height || !productData.dimensions.depth) {
                    throw new Error('Все размеры должны быть указаны');
                }
                // Преобразуем строки в числа
                productData.dimensions.width = Number(productData.dimensions.width);
                productData.dimensions.height = Number(productData.dimensions.height);
                productData.dimensions.depth = Number(productData.dimensions.depth);
            } catch (e) {
                console.error('Dimensions parsing error:', e);
                throw new Error('Неверный формат размеров');
            }
        }

        // Проверка наличия изображений
        if (!req.files || req.files.length === 0) {
            throw new Error('Необходимо загрузить хотя бы одно изображение');
        }

        // Обработка изображений
        productData.images = req.files.map(file => file.path.replace(/\\/g, '/'));

        // Преобразование цены в число
        if (productData.price) {
            productData.price = Number(productData.price);
            if (isNaN(productData.price) || productData.price <= 0) {
                throw new Error('Цена должна быть положительным числом');
            }
        }

        console.log('Processed product data:', productData);

        const product = new Product(productData);
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Error in createProduct:', error);

        // Удаляем загруженные файлы в случае ошибки
        if (req.files) {
            for (const file of req.files) {
                try {
                    await unlinkFile(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
        }

        res.status(400).json({
            message: error.message || 'Ошибка при создании товара',
            details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
        });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.category = req.body.category || product.category;
        product.subcategory = req.body.subcategory || product.subcategory;
        product.dimensions = req.body.dimensions || product.dimensions;
        product.isNew = req.body.isNew !== undefined ? req.body.isNew : product.isNew;
        product.isPopular = req.body.isPopular !== undefined ? req.body.isPopular : product.isPopular;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Товар не найден');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Товар не найден');
    }

    try {
        // Delete images from uploads folder
        if (product.images && product.images.length > 0) {
            for (const imagePath of product.images) {
                try {
                    const fullPath = path.join(__dirname, '..', imagePath);
                    await unlinkFile(fullPath);
                } catch (error) {
                    console.error(`Error deleting image ${imagePath}:`, error);
                    // Continue with other images even if one fails
                }
            }
        }

        // Delete the product from database
        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Товар успешно удален' });
    } catch (error) {
        console.error('Error during product deletion:', error);
        res.status(500);
        throw new Error('Ошибка при удалении товара');
    }
});

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};