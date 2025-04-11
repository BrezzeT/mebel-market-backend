const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Создаем папку для загрузки, если её нет
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Публичные маршруты
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Защищенные маршруты (только для админа)
router.post('/', protect, admin, upload.array('images', 5), productController.createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router; 