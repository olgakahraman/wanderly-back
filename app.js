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
app.use(
  session({
    secret: 'wanderly_temp_secret',
    resave: false,
    saveUninitialized: true,
  })
);

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

app.get('/travel-map', (req, res) => {
  const visitedCountries = req.session.visitedCountries || [];
  res.render('travel-map', {
    user: req.session.user || 'Guest',
    visitedCountries,
    countries: ['Italy', 'Japan', 'Mexico', 'Norway', 'Thailand'], 
  });
});

app.post('/travel-map', (req, res) => {
  if (!req.session.visitedCountries) {
    req.session.visitedCountries = [];
  }

  if (
    req.body.country &&
    !req.session.visitedCountries.includes(req.body.country)
  ) {
    req.session.visitedCountries.push(req.body.country);
    req.session.user = 'OLGA';
  }

  res.redirect('/travel-map');
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/posts', posts);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();

// swagger docs http://localhost:3000/api-docs/
