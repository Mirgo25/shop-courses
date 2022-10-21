const {Router} = require('express');
const {validationResult} = require('express-validator');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');


const router = Router();

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Add Course',
        isAdd: true
    });
});

router.post('/', auth, courseValidators, async (req, res) => {
    /** 
     * Для роботи з файлом
     * const course = new Course(req.body.title, req.body.price, req.body.img);
     */

    //Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // req.flash('addError', errors.array()[0].msg);  // Використовується з res.redirect(), чомусь не з res.render() 
        return res.status(422).render('add', {
            title: 'Add Course',
            isAdd: true,
            addError: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img
            }
        });
    }

    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userID: req.user._id
    })

    try {
        await course.save();
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;