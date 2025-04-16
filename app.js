const express = require('express');
const app = express();
const posts = require('./routes/posts');
const connectDB = require('./db/connect');
require('dotenv').config();

app.use(express.json());

app.get('/hello', (req, res) => {
  res.send('Wanderly app server side is here');
});

app.use('/api/v1/posts', posts);

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
