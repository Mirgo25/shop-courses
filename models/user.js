const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    avatarURL: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseID: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course', // Пов'язуємо з моделлю "Course"
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(course) {
    const items = [...this.cart.items]; // or "const items = this.cart.items.concat()" to clone array
    const idx = items.findIndex(c => {
        return c.courseID.toString() === course._id.toString();
    });

    if (idx >= 0) {
        items[idx].count++;
    } else {
        items.push({
            count: 1,
            courseID: course._id
        });
    }

    // const newCart = {items: items};
    // this.cart = newCart;
    // or
    this.cart = {items};
    return this.save();
};

userSchema.methods.removeFromCart = function(id) {
    let items = [...this.cart.items];
    const idx = items.findIndex( c => c.courseID.toString() === id.toString());

    if (items[idx].count === 1) {
        items = items.filter( c => c.courseID.toString() !== id.toString());
    } else {
        items[idx].count--;
    }

    this.cart = {items};
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
};

module.exports = model('User', userSchema);