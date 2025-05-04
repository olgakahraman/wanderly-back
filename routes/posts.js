const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require('../controllers/posts');

router.route('/').get(auth, getAllPosts).post(auth, createPost);

router
  .route('/:id')
  .get(auth, getPost)
  .patch(auth, updatePost)
  .delete(auth, deletePost);

module.exports = router;
