const { body, param } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
  body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.loginValidator = [
  body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.contactValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone').optional({ nullable: true }).trim(),
  body('notes').optional({ nullable: true }).isLength({ max: 1000 }).withMessage('Notes too long')
];

exports.idValidator = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
