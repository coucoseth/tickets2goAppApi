const express = require('express');
const multer = require('multer');
const { emailValidation, handleValidation } = require('../middleware/validators');
const { waitlistLimiter } = require('../middleware/rateLimiters');
const { subscribe } = require('../controllers/waitlistController');

const router = express.Router();

// Disallow files, but support multipart/form-data with text fields if clients send forms
const upload = multer({ limits: { fileSize: 0 } });

// POST /api/waitlist/subscribe
router.post(
  '/subscribe',
  waitlistLimiter,           // rate limit per IP (100 req / 15 min)
  upload.none(),             // parse text fields from multipart/form-data, reject files
  emailValidation,           // validate & sanitize email with express-validator
  handleValidation,          // return 400 on validation errors
  subscribe                  // controller
);

module.exports = router;
