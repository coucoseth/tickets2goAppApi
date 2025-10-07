const { body, validationResult } = require('express-validator');

// Validate and sanitize email field
const emailValidation = [
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required.')
    .bail()
    .isString().withMessage('Email must be a string.')
    .bail()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .bail()
    // Keep dots for gmail to avoid altering user input semantics
    .normalizeEmail({ gmail_remove_dots: false })
    .customSanitizer((v) => (v || '').toLowerCase())
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

module.exports = { emailValidation, handleValidation };