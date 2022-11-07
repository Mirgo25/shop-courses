const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/openapi.yaml');
require('dotenv').config()
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const homeRoutes = require('./routes/home');
const cartRoutes = require('./routes/cart');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const addRoutes = require('./routes/add');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// const User = require('./models/user');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');


const app = express();

// Конфігурація handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
});

const store = new MongoStore({
    collection: 'sessions',
    uri: process.env.MONGODB_URI,

});

// Реєстрація в express що є взагалі такий двіжок 'hbs'
app.engine('hbs', hbs.engine);
// Тут ми вже використовуємо 'hbs'
app.set('view engine', 'hbs');
app.set('views', './views');


// Власний middleware для додавання нового функціоналу
// app.use( async (req, res, next) => {
//     try {
//         // Робимо так, щоб в об'єкта req завжди був присутній об'єкт user 
//         const user = await User.findById('633229ccfb62364ffc943aec');
//         req.user = user;
//         // Викликаємо next() для того щоб наступні middleware відпрацювали
//         next();
//     } catch (e) {
//         console.log(e);
//     }
// });


// Додаємо нові middlewares, які додають нову функціональність 
app.use(
    // Робимо папку public статичною 
    express.static(path.join(__dirname, 'public'))
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "https:", "data:"],
            "script-src-elem": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

// Підключаємо Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Реєструємо роути додатка
app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);


app.use(errorHandler); // Завжди вкінці обробка 404 помилки

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

        // Створюємо юзера
        // const candidate = await User.findOne();
        // if (!candidate) {
        //     const user = new User({
        //         email: 'mirgo@gmail.com',
        //         name: 'Ihor',
        //         cart: {items: []}
        //     });
        //     await user.save();
        // }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}...`);
        });
    } catch (e) {
        console.error(e);
    }
}

start();
