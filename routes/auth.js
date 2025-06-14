const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authLimiter = require('../middleware/rateLimiter');
const passport = require('passport');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  registerPage,
  loginPage,
  logout,
} = require('../controllers/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth for users
 */


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
    check('newPassword', 'Password must be 6+ characters').isLength({ min: 6 }),
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

router.get('/register', registerPage);
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/auth/register');
    }
    next();
  },
  register
);

router.get('/login', loginPage);
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/travel-map',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get('/logout', logout);

module.exports = router;
