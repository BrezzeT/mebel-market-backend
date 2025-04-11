const express = require('express');
const router = express.Router();
const {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    getBannersByPosition
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const bannerUploadMiddleware = require('../middleware/bannerUploadMiddleware');

// Public routes
router.get('/', getBanners);
router.get('/position/:position', getBannersByPosition);
router.get('/:id', getBannerById);

// Admin routes
router.post('/', protect, admin, bannerUploadMiddleware.single('image'), createBanner);
router.put('/:id', protect, admin, bannerUploadMiddleware.single('image'), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router; 