// routes/users.js
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

router.get('/me', auth, getMe);
router.patch('/me', auth, updateMe);
router.patch('/me/password', auth, changePassword);

router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar);
router.delete('/me/avatar', auth, deleteAvatar);

router.get('/:id/avatar', getAvatar);

module.exports = router;
