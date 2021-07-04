const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');

const User = require('../controllers/user');
const validate = require('../middlewares/validate');

const router = express.Router();

const upload = multer().single('profileImage')

// INDEX
router.get('/', User.index);

//STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid address'),
    check('password').isEmpty().isLength({ min: 6 }).withMessage('Must be atleast 6 chars long'),
    check('firstName').not().isEmpty().withMessage('first name is required'),
    check('lastName').not().isEmpty().withMessage('lastName is required')
], validate, User.store);

// SHOW
router.get('/id', User.show)

//UPDATE
router.get('/:id', upload, User.update);

// DELETE
router.delete('/:id', User.destroy);

module.exports = router;
