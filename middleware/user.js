// Middleware для перетворення даних в сесії в існуючий функціонал
// бо в сесії зберігається не об'єкт а просто дані які не мають методів

const User = require('../models/user');

module.exports = async function(req, res, next) {
    if (!req.session.user) {
        return next();
    }
    req.user = await User.findById(req.session.user._id);
    next();
};