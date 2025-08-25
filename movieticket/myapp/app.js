// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');

// Middleware
const { attachUser } = require('./middleware/auth');



// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();

// ==========================
// Session Store
// ==========================
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'db_movieticket'
});

// ==========================
// Middleware Setup
// ==========================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'supersecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());
// Middleware to set flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(attachUser);

// ==========================
// Static + View Engine
// ==========================
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================
// Routes
// ==========================
app.use('/', indexRoutes);
app.use('/auth', authRoutes);        
app.use('/movies', movieRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
// ==========================
// Export app (server runs in bin/www)
// ==========================
module.exports = app;
