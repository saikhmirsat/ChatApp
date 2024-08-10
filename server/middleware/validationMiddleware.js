const { body } = require('express-validator');

exports.registerValidation = [
    body('userName').notEmpty().withMessage('Username is required.'),
    body('nickName').notEmpty().withMessage('Nickname is required.'),
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    // body('dateOfBirth').isDate().withMessage('Valid date of birth is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
];

exports.loginValidation = [
    body('emailOrUsername')
        .notEmpty().withMessage('Username or email is required.')
        .custom(value => {
            // If the input includes an "@" symbol, validate it as an email.
            if (value.includes('@')) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error('Valid email is required.');
                }
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.')
];
