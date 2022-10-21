const path = require('path');
const fs = require('fs');


const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
)

class Cart {
    static async add(course) {
        const cart = await Cart.fetch();

        const idx = cart.courses.findIndex(c => c.id === course.id);
        const candidate = cart.courses[idx];

        if (candidate) {
            // If course is already in cart
            candidate.count++;
            cart.courses[idx] = candidate;
        } else {
            // If course isn't in cart
            course.count = 1;
            cart.courses.push(course);
        }

        cart.price += +course.price;

        return new Promise( (resolve, reject) => {
            fs.writeFile(
                p,
                JSON.stringify(cart),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            )
        });
    }

    static async remove(id) {
        const cart = await Cart.fetch();

        const idx = cart.courses.findIndex(c => c.id === id);
        const course = cart.courses[idx];

        if (course.count === 1) {
            // Видаляємо курс з масиву 'courses'
            cart.courses = cart.courses.filter(c => c.id !== id);
        } else {
            // Знижуємо count на 1
            course.count--;
        }

        cart.price -= course.price;

        return new Promise( (resolve, reject) => {
            fs.writeFile(
                p,
                JSON.stringify(cart),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(cart);
                    }
                }
            )
        });
    }

    static fetch() {
        return new Promise( (resolve, reject) => {
            fs.readFile(
                p,
                'utf-8',
                (err, content) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(JSON.parse(content));
                    }
                }
            )
        });        
    }
}


module.exports = Cart;