const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/posts');

const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
  },
});

const uploadPic = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management
 */

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', getPost);

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create new post (with optional images)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:    { type: string }
 *               content:  { type: string }
 *               location: { type: string }
 *               tags:     { type: string, description: "comma separated" }
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', auth, uploadPic.array('images', 10), createPost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Post' }
 *     responses:
 *       200: { description: Post updated }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Not authorized }
 *       404: { description: Post not found }
 */
router.patch('/:id', auth, updatePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Post deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Not authorized }
 *       404: { description: Post not found }
 */
router.delete('/:id', auth, deletePost);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   patch:
 *     summary: Like/unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Like status updated }
 *       400: { description: Cannot like your own post }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { description: Post not found }
 */
router.patch('/:id/like', auth, likePost);

module.exports = router;
