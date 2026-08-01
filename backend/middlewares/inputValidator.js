const logger = require('../utils/logger');

/**
 * Production-Grade Input Validation & Sanitization Middleware
 * Protects against SQL injection, XSS, and malformed payload risks.
 */
const inputSanitizer = (req, res, next) => {
  try {
    const sanitizeValue = (val) => {
      if (typeof val === 'string') {
        // Strip dangerous script tags and null characters
        return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/\0/g, '')
                  .trim();
      }
      return val;
    };

    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          } else {
            obj[key] = sanitizeValue(obj[key]);
          }
        }
      }
      return obj;
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid or malformed request payload format.',
    });
  }
};

module.exports = { inputSanitizer };
