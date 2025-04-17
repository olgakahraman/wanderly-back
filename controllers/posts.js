const Post = require('../models/Post');

const getAllPosts = async (req, res) => {
  const posts = await Post.find({ author: req.user.userId });
  res.status(200).json({ posts });
};

const createPost = async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user.userId });
  res.status(201).json({ post });
};

const getPost = async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    author: req.userId,
  });
  if (!post) {
    return res.status(404).json({ msg: 'Post not found' });
  }
  res.status(200).json({ post });
};

const updatePost = async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!post) {
    return res.status(404).json({ msg: 'Post not found or unauthorized' });
  }
  res.status(200).json({ post });
};

const deletePost = async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id:req.params.id,
    author:req.user.userId,
  })
  if(!post){
    return res.status(404).json({msg:'Post not found or authorized'})
  }
  res.status(200).json({msg:'Post deleted'})
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
