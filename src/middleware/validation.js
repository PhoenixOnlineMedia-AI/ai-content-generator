const { body, validationResult } = require('express-validator');

const validateContentRequest = [
  body('content').isString().notEmpty().trim(),
  body('keywords').optional().isArray(),
  body('targetLength').optional().isInt({ min: 100, max: 10000 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateContentRequest
};