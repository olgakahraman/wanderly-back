const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Post = require('../models/Post');

const NUM_USERS = 5;
const NUM_POSTS = 10;

function makeFakeUser() {
  return {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: 'Password123!',
  };
}

function makeFakePost(userId) {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    author: userId,
  };
}

async function seedDatabase() {
  try {
    await User.deleteMany();
    await Post.deleteMany();

    const createdUsers = [];

    const testUser = new User({
      username: 'testuser',
      email: 'test@test.com',
      password: 'Password123!',
    });
    await testUser.save();
    createdUsers.push(testUser);

    for (let i = 0; i < NUM_USERS - 1; i++) {
      const userData = makeFakeUser();
      const newUser = new User(userData);
      await newUser.save();
      createdUsers.push(newUser);
    }

    for (let i = 0; i < NUM_POSTS; i++) {
      const randomUser =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const postData = makeFakePost(randomUser._id);
      const newPost = new Post(postData);
      await newPost.save();
    }

    console.log('DB filled successfully!');
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
}

module.exports = seedDatabase;
