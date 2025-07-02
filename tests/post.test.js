const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../util/seed_db');
require('dotenv').config({ path: '.env.test' });

chai.should();
chai.use(chaiHttp);

let token = '';

describe('POST API', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    await seedDatabase();
  });

  it('should fetch all posts', async () => {
    const res = await chai.request(app).get('/api/v1/posts');
    res.should.have.status(200);
    res.body.posts.should.be.an('array');
  });

  it('should create a new post after login', async () => {
    const loginRes = await chai
      .request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Password123!' });

    token = loginRes.body.token;

    const res = await chai
      .request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Test Post', content: 'Test content' });

    res.should.have.status(201);
    res.body.post.should.include.keys('title', 'content', 'author');
  });
});
