const express = require('express');
const { check } = require('express-validator');

const Auth = require('../controllers/auth');
const Password = require('../controllers/password');
const validate = require('../middlewares/validate');

const router = express.Router();


router.get('/', (req, res) => {
    res.status(200).json({ message: "You are in the Auth Endpoint, Register or Login to Test authentication" })
});

router.post('/register', [
    check('email').isEmail().withMessage('Enter a valid address'),
    check('password').isEmpty().isLength({ min: 6 }).withMessage('Must be atleast 6 chars long'),
    check('firstName').not().isEmpty().withMessage('first name is required'),
    check('lastName').not().isEmpty().withMessage('lastName is required')
], validate, Auth.register);

router.post('/login', [
    check('email').isEmail().withMessage('Enter a valid Email address'),
    check('password').not().isEmpty()
], validate, Auth.login);

// EMAIL VERIFICATION
router.get('/verify/:token', Auth.verify());
router.post('/resend', Auth.resendToken);

// PASSWORD RESET
router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid address')
], validate, Password.recover);

router.get('/reset/:token', Password.reset);

router.get('/reset/:token', [
    check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be atleast 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
], validate, Password.resetPassword);

module.exports = router;



