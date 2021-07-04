const passport = require('passport');

module.exports = (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
        if (err) return next(err);

        if (!user) return res.status(400).json({ message: 'unauthorized access: No Token Provided' })
        
        req.user = user;

        next();
    })(req, res, next);
};