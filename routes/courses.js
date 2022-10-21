const {Router} = require('express');
const {validationResult} = require('express-validator');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');


const router = Router();

function isOwner(course, req) {
    return course.userID.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
                    .populate('userID', 'email name')
                    .select('price title img');
        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }
    try {
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        
        res.render('course-edit', {
            title: `Edit ${course.title}`,
            course,
            editError: req.flash('editError')
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/id-:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit', auth, courseValidators, async (req, res) => {
    const {id} = req.body;

    //Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('editError', errors.array()[0].msg);
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
    }

    try {
        delete req.body.id;
        const course = await Course.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }
        
        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses'); 
    } catch (e) {
        console.log(e);
    }
});

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userID: req.user._id
        });

        res.redirect('/courses');
        
    } catch (e) {
        console.log(e);
    }
});


module.exports = router;