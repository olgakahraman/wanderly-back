const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'username email hasAvatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Server error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const imagePaths = Array.isArray(req.files)
      ? req.files.map(f => `/uploads/posts/${f.filename}`)
      : [];

    const post = await new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.userId,
      location: req.body.location || null,
      tags: prepareTags(req.body.tags),
      images: imagePaths,
    }).save();

    const populated = await Post.findById(post._id).populate(
      'author',
      'username email'
    );

    res.status(201).json({ post: populated });
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
    }).populate('author', 'username email');

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
      .filter(Boolean);
  return [];
}

function handleUpdateError(error, res) {
  console.error('Update error:', error);
  if (error.name === 'ValidationError') {
    const errors = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return res
      .status(400)
      .json({ error: 'Validation failed', details: errors });
  }
  res.status(500).json({ error: 'Server error', details: error.message });
}

const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId).populate(
      'author',
      'username email'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (String(post.author._id) === String(userId)) {
      return res.status(400).json({ error: 'Cannot like your own post' });
    }

    const hasLiked = post.likes.some(like => like.toString() === userId);

    let updatedPost;
    if (hasLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      ).populate('author', 'username email');
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      ).populate('author', 'username email');
    }

    res.status(200).json({ post: updatedPost });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ msg: 'Not authorized to delete this post' });
    }
    if (Array.isArray(post.images)) {
      for (const imgPath of post.images) {
        const absPath = path.join(process.cwd(), imgPath);
        fs.unlink(absPath, err => {
          if (err) console.warn('Failed to delete file:', absPath, err.message);
        });
      }
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  likePost,
  deletePost,
};
