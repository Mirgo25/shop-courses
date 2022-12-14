const {Schema, model} = require('mongoose');

const orderSchema = Schema({
    courses: [
        {
            course: {
                type: Object,
                required: true
            },
            count: {
                type: Number,
                required: true
            }               
        }
    ],
    user: {
        name: String,
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    date: {
        type: Date,
        default: Date.now
    }

});



module.exports = model('Order', orderSchema);