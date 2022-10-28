const {Router} = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const User = require('../models/user');
require('dotenv').config();
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const {registerValidators, loginValidators} = require('../utils/validators');


const router = Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mirgo2513@gmail.com',
      pass: process.env.GMAIL_APP_KEY // naturally, replace both with your real credentials or an application-specific password
    }
  });

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('login#login');
    });
});

router.post('/login', loginValidators, async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('loginError', errors.array()[0].msg);
        return res.status(422).redirect('/auth/login#login');
    }

    try {        
        const candidate = await User.findOne({ email: req.body.email });            
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save( err => {
            if (err) {
                throw err;
            }
    
            res.redirect('/');
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        const {email, password, name} = req.body;

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
                email, name,
                password: hashPassword,
                cart: { items: [] }
            });
        await user.save();
        res.redirect('/auth/login#login');

        
        await transporter.sendMail(regEmail(email), function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset Password',
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            // Якщо чомусь не змогли згенерить якийсь ключ
            if (err) {
                req.flash('error', 'Something goes wrong... Try later.');   
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();

                await transporter.sendMail(resetEmail(candidate.email, token), function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                
                res.redirect('/auth/login#login');
            } else {
                req.flash('error', 'There is no such user with this email!');
                res.redirect('/auth/reset');
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req, res) => {

    
    if (!req.params.token) {
        return res.redirect('/auth/login#login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        });
        
        if (!user) {
            res.redirect('/auth/login#login');
        } else {
            res.render('auth/password', {
                title: 'Change password',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('loginError', 'Token lifetime expired')
            res.redirect('/auth/login#login');
        } else {
            user.password  = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
});
module.exports = router;