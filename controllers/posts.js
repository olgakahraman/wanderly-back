const Post = require('../models/Post');

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Server error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const post = await new Post({
      ...req.body,
      author: req.user.userId,
    }).save();
    res.status(201).json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author');
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ msg: 'Post not found or unauthorized' });
    }
    res.status(200).json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const userId = req.user.userId;

    if (post.author.toString() === userId) {
      return res.status(400).json({ msg: "You can't like your own post" });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ post });
  } catch (error) {
    console.error('Error in likePost:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.userId,
    });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found or unauthorized' });
    }
    res.status(200).json({ msg: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
};
