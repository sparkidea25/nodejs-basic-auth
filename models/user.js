const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jwt');
const crypto = require('crypto');

const Token = require('../models/token');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: 'Your email is required',
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: 'Your username is required'
    },
    password: {
        type: String,
        unique: true,
        required: 'Your password is required'
    },
    firstName: {
        type: String,
        required: 'Your firstname is required',
        max: 100
    },
    lastName: {
        type: String,
        required: 'Your lastname is required',
        max: 100
    },
    bio: {
        type: String,
        required: false,
        max: 255
    },
    profileImage: {
        type: String,
        required: false,
        max: 225
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, { timestamps: false });

UserSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return (next);

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    })
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function () {
    const today = new Date()

    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
};

UserSchema.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(20).string('hex');
    this.resetPasswordExpires = Date.now() + 3600000;
};

UserSchema.methods.generateVerificationToken = function () {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).string('hex')
    };
    return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);

