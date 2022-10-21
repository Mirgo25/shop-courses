const {Router} = require('express');
// const Cart = require('../models/cart');
const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();


// Допоміжна функція для створення items із cart
function mapCartItems(cart) {
    return cart.items.map( c => ({
        ...c.courseID._doc,
        id: c.courseID._id,
        count: c.count
    }));
}

// Для розрахунку ціни
function computePrice(courses) {
    return courses.reduce( (total, course) => {
        return total += course.price * course.count;
    }, 0);
}


router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);

    // await Cart.add(course);
    await req.user.addToCart(course);
    
    res.redirect('/cart');
});

router.delete('/remove/:id', auth, async (req, res) => {
    // const cart = await Cart.remove(req.params.id); // Для роботи з файлами
    await req.user.removeFromCart(req.params.id);

    const user = await req.user.populate('cart.items.courseID');
    
    const courses = mapCartItems(user.cart)
    const cart = {
        courses,
        price: computePrice(courses)
    };

    res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
    // const cart = await Cart.fetch(); // Для роботи з файлами
    const user = await req.user.populate('cart.items.courseID');

    const courses = mapCartItems(user.cart);

    res.render('cart', {
        title: `Cart`,
        isCart: true,
        courses: courses,
        price: computePrice(courses)
    });
});


module.exports = router;