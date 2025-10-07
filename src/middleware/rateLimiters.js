const rateLimit = require('express-rate-limit');

// Recommended waitlist limiter: 100 requests per 15 minutes per IP
const waitlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true, // add RateLimit-* headers
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

module.exports = { waitlistLimiter };