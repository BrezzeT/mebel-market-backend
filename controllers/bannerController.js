const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');

// Configure multer for banner image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/banners');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('image');

exports.uploadMiddleware = upload;

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
    const { position, type, isActive } = req.query;
    
    let query = {};
    
    if (position) {
        query.position = position;
    }
    
    if (type) {
        query.type = type;
    }
    
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }
    
    const banners = await Banner.find(query)
        .sort({ priority: -1, createdAt: -1 });
    
    res.json(banners);
});

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
        res.json(banner);
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        image,
        link,
        position,
        isActive,
        startDate,
        endDate,
        priority,
        type,
        backgroundColor,
        textColor,
        buttonText,
        buttonColor
    } = req.body;
    
    const banner = new Banner({
        title,
        description,
        image,
        link,
        position,
        isActive,
        startDate,
        endDate,
        priority,
        type,
        backgroundColor,
        textColor,
        buttonText,
        buttonColor
    });
    
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        image,
        link,
        position,
        isActive,
        startDate,
        endDate,
        priority,
        type,
        backgroundColor,
        textColor,
        buttonText,
        buttonColor
    } = req.body;
    
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
        banner.title = title || banner.title;
        banner.description = description || banner.description;
        banner.image = image || banner.image;
        banner.link = link || banner.link;
        banner.position = position || banner.position;
        banner.isActive = isActive !== undefined ? isActive : banner.isActive;
        banner.startDate = startDate || banner.startDate;
        banner.endDate = endDate || banner.endDate;
        banner.priority = priority !== undefined ? priority : banner.priority;
        banner.type = type || banner.type;
        banner.backgroundColor = backgroundColor || banner.backgroundColor;
        banner.textColor = textColor || banner.textColor;
        banner.buttonText = buttonText || banner.buttonText;
        banner.buttonColor = buttonColor || banner.buttonColor;
        
        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
        await banner.remove();
        res.json({ message: 'Banner removed' });
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
});

// @desc    Get active banners by position
// @route   GET /api/banners/position/:position
// @access  Public
const getBannersByPosition = asyncHandler(async (req, res) => {
    const banners = await Banner.find({
        position: req.params.position,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    }).sort({ priority: -1, createdAt: -1 });
    
    res.json(banners);
});

module.exports = {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    getBannersByPosition
}; 