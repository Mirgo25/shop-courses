const {Router} = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({'user.userID': req.user._id})
            .populate('user.userID');


        res.render('orders', {
            title: 'Orders',
            isOrder: true,
            orders: orders.map( o => {
                return {
                    ...o._doc,
                    price: o.courses.reduce( (total, c) => {
                        return total += c.count * c.course.price;
                    }, 0)
                }
            })
        });
    } catch (e) {
        console.log(e);
    }


});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseID');
        
        const courses = user.cart.items.map( c => ({ 
            course: {...c.courseID._doc},
            count: c.count 
        }));

        const order = new Order({
            courses: courses,
            user: {
                name: req.user.name,
                userID: req.user
            }
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('orders');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;