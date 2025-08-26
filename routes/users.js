const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');

const {
  getMe,
  updateMe,
  changePassword,
  getAvatar,
  uploadAvatar,
  deleteAvatar,
} = require('../controllers/users');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
 *   - name: Users
 *     description: Profile & avatar management
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch('/me', auth, updateMe);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   patch:
 *     summary: Change my password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Missing/invalid payload
 *       401:
 *         description: Unauthorized
 */
router.patch('/me/password', auth, changePassword);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   post:
 *     summary: Upload my avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       204:
 *         description: Uploaded (no content)
 *       400:
 *         description: Only image files are allowed / no file
 *       401:
 *         description: Unauthorized
 */
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   delete:
 *     summary: Delete my avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted (no content)
 *       401:
 *         description: Unauthorized
 */
router.delete('/me/avatar', auth, deleteAvatar);

/**
 * @swagger
 * /api/v1/users/{id}/avatar:
 *   get:
 *     summary: Get avatar by user id (binary)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image stream
 *         content:
 *           image/jpeg: {}
 *           image/png: {}
 *           image/webp: {}
 *       404:
 *         description: Not found
 */
router.get('/:id/avatar', getAvatar);

module.exports = router;
