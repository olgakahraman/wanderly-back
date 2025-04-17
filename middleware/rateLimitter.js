const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    msg: 'Too many requests from this IP, please try again after a minute',
  },
});

module.exports = authLimiter;