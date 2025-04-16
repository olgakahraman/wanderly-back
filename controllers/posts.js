const Post = require('../models/Post');

const getAllPosts = (req, res) => {
  res.send('get all posts');
};

const createPost = async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json({ post });
};

const getPost = (req, res) => {
  res.json({ id: req.params.id });
};

const updatePost = (req, res) => {
  res.send('update post');
};

const deletePost = (req, res) => {
  res.send('delete post');
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
