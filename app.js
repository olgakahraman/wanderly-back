const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const posts = require('./routes/posts');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

const notFound = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const connectDB = require('./db/connect');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'https://wanderly-front.onrender.com',
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static('uploads'));

app.get('/hello', (_req, res) => res.send('Wanderly app server side is here'));
app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
);

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/posts', posts);
app.use('/api/v1/users', usersRoute);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

// swagger docs: http://localhost:3000/api-docs/
