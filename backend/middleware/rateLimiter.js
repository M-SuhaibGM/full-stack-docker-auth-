// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const core = require('../config/core');

const limiter = rateLimit({
  windowMs: core.security.rateLimit.windowMs,
  max: core.security.rateLimit.max,
  message: { msg: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain IPs or in development
    return process.env.NODE_ENV === 'development';
  }
});

module.exports = limiter;