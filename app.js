const express = require('express');
const app = express();
const posts = require('./routes/posts');
const authRoute = require('./routes/auth');
const authMiddleware = require('./middleware/auth.js');
const connectDB = require('./db/connect');
require('dotenv').config();

app.use(express.json());

app.get('/hello', (req, res) => {
  res.send('Wanderly app server side is here');
});

// app.use('/api/v1/posts', posts);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/posts', authMiddleware, posts);


const port = 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
