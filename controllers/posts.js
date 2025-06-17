const Post = require('../models/Post');
const mongoose = require('mongoose');

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
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      ...(req.body.location !== undefined && {
        location: req.body.location || null,
      }),
      tags: prepareTags(req.body.tags),
    };

    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this post' });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    res.status(200).json({ post });
  } catch (error) {
    handleUpdateError(error, res);
  }
};

function prepareTags(tags) {
  if (Array.isArray(tags)) return tags.filter(t => t && t.trim().length > 0);
  if (typeof tags === 'string')
    return tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);
  return [];
}

function handleUpdateError(error, res) {
  console.error('Update error:', error);

  if (error.name === 'ValidationError') {
    const errors = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  res.status(500).json({
    error: 'Server error',
    details: error.message,
  });
}

const likePost = async (req, res) => {
  try {
    console.log('=== LIKE POST DEBUG ===');
    console.log('Post ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    console.log('User object:', req.user);

    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    console.log('Found post:', post ? 'YES' : 'NO');

    if (!post) {
      console.log('Post not found in database');
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log('Post author:', post.author);
    console.log('Post likes before:', post.likes);
    console.log(
      'User likes before:',
      post.likes.map(l => l.toString())
    );
    console.log('Current user ID:', userId);

    const hasLiked = post.likes.some(like => like.toString() === userId);
    console.log('User has liked this post:', hasLiked);

    let updatedPost;

    if (hasLiked) {
      console.log('Removing like...');
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      ).populate('author', 'username email');
    } else {
      console.log('Adding like...');
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      ).populate('author', 'username email');
    }

    console.log('Post likes after:', updatedPost.likes);
    console.log('Operation completed successfully');
    console.log('=== END LIKE POST DEBUG ===');

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('=== LIKE POST ERROR ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid post ID format',
        details: 'The provided ID is not a valid MongoDB ObjectId',
      });
    }

    res.status(500).json({
      error: 'Server error',
      details: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
};

const deletePost = async (req, res) => {
  try {
    console.log('Deleting post with ID:', req.params.id);
    console.log('User ID:', req.user.userId);

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ msg: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ msg: 'Post deleted successfully' });
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
