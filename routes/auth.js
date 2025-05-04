const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authLimiter = require('../middleware/rateLimiter');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');


router.post(
  '/register',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

router.post(
  '/forgot-password',
  authLimiter,
  [check('email', 'Please include a valid email').isEmail()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    check('token', 'Token is required').notEmpty(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  resetPassword
);

module.exports = router;
