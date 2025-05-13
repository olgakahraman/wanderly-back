const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/posts');

 router.get('/', getAllPosts);
 router.get('/:id', getPost);

router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/like', auth, likePost);

module.exports = router;
