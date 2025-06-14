const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const posts = require('./routes/posts');
const authRoute = require('./routes/auth');
const authMiddleware = require('./middleware/auth.js');
const notFound = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const connectDB = require('./db/connect');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'wanderly_temp_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 24 * 60 * 60 * 1000,
          secure: false, 
          httpOnly: true,
        },
      })
    );

    require('./config/passport')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.use((req, res, next) => {
      res.locals.user = req.user || null;
      res.locals.error = req.flash('error');
      res.locals.success = req.flash('success');
      next();
    });

    const allowedOrigins = [
      'http://localhost:5173',
      'https://wanderly-backend.onrender.com',
    ];

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    app.use(helmet());

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get('/hello', (req, res) => {
      res.send('Wanderly app server side is here');
    });

    const ensureAuthenticated = (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error', 'Please login to view this page');
      res.redirect('/auth/login');
    };

    app.get('/travel-map', ensureAuthenticated, (req, res) => {
      if (!req.session.visitedCountries) {
        req.session.visitedCountries = [];
      }
      res.render('travel-map', {
        user: req.user,
        visitedCountries: req.session.visitedCountries,
        countries: ['Italy', 'Japan', 'Mexico', 'Norway', 'Thailand'],
        messages: {
          error: req.flash('error'),
          success: req.flash('success'),
        },
      });
    });

    app.post('/travel-map', ensureAuthenticated, (req, res) => {
      if (!req.session.visitedCountries) {
        req.session.visitedCountries = [];
      }

      if (
        req.body.country &&
        !req.session.visitedCountries.includes(req.body.country)
      ) {
        req.session.visitedCountries.push(req.body.country);
        req.flash(
          'success',
          `${req.body.country} added to your visited countries!`
        );
      } else if (req.session.visitedCountries.includes(req.body.country)) {
        req.flash('error', `${req.body.country} is already in your list!`);
      }

      res.redirect('/travel-map');
    });

    app.use('/auth', authRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/posts', posts);

    app.use(notFound);
    app.use(errorHandlerMiddleware);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
