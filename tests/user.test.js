const chai2 = require('chai');
const chaiHttp2 = require('chai-http');
const app2 = require('../app');
const mongoose2 = require('mongoose');
const seedDatabase2 = require('../util/seed_db');
require('dotenv').config({ path: '.env.test' });

chai2.should();
chai2.use(chaiHttp2);

describe('User registration & login', () => {
  before(async () => {
    await mongoose2.connect(process.env.MONGO_URI_TEST);
    await seedDatabase2();
  });

  it('should register a new user', async () => {
    const res = await chai2.request(app2).post('/api/v1/auth/register').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'Password123!',
    });

    res.should.have.status(201);
    res.body.should.have.property('token');
  });

  it('should login with correct credentials', async () => {
    const res = await chai2.request(app2).post('/api/v1/auth/login').send({
      email: 'test@test.com',
      password: 'Password123!',
    });

    res.should.have.status(200);
    res.body.should.have.property('token');
  });
});
