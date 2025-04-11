const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email }); // Логируем попытку входа

        // Проверяем, что email и пароль предоставлены
        if (!email || !password) {
            return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
        }

        // Ищем пользователя
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No'); // Логируем результат поиска

        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No'); // Логируем результат проверки пароля

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем права администратора
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'У вас нет прав администратора' });
        }

        // Создаем токен
        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Ошибка при входе в систему',
            error: error.message
        });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Ошибка при получении профиля',
            error: error.message
        });
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = {
    loginUser,
    getUserProfile
}; 