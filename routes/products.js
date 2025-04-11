const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getNewProducts,
    getPopularProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/new', getNewProducts);
router.get('/popular', getPopularProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, uploadMiddleware.array('images', 5), createProduct);
router.put('/:id', protect, admin, uploadMiddleware.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router; 