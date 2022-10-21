const {body} = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');


exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Enter correct email!')
        .custom( async (value) => {
                try {
                    const candidate = await User.findOne({ email: value});
                    if (candidate) {
                        return Promise.reject('User with this email already exists!');
                    }
                } catch (e) {
                    console.log(e);
                }
            })
        .normalizeEmail(),
    body('password', 'Password should contain 3 or more characters!')
        .isLength({min: 3, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords should match!');
            }
            return true;
        })
        .trim()
];

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Incorrect email!')
        .custom( async (value, {req}) => {
            try {
                if (!(req.body.email && req.body.password)) {
                    return Promise.reject('You should fill in each field!');
                }

                const candidate = await User.findOne({ email: value });
                if (!candidate) {
                    return Promise.reject('User does not exist!');
                }
            } catch (e) {
                console.log('Email: ', value)
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password')
        .isLength({min: 3, max: 56}).withMessage('Short password!')
        .isAlphanumeric()
        .custom( async (value, {req}) => {
            try {
                if (!( (req.body.email === '@' || req.body.email) && req.body.password)) {
                    return Promise.reject('You should fill in each field!');
                }
                
                const candidate = await User.findOne({ email: req.body.email});
                if (candidate) {
                    const areSame = await bcrypt.compare(value, candidate.password);
                    if (!areSame) {
                        return Promise.reject('Incorrect password!');
                    } 
                }
            } catch (e) {
                console.log('Password: ', value)
                console.log('Password req: ', req.body)
                console.log('Condition: ', !(req.body.email && req.body.password))

                console.log(e);
            }
        })
        .trim()
];

exports.courseValidators = [
    body('title').isLength({ min: 1}).withMessage('Name too short!'),
    body('price').isNumeric().withMessage("Price must contain only numbers!"),
    body('img', "Incorrect URL of image!").isURL()
];