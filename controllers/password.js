const User = require('../models/user');
const { SendEmail } = require('../utils/index');
const express = require('express');
const user = require('../models/user');

let api = express();

api.post('/api/auth/recover', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ message: 'The email address' + req.body.email + 'is not associated with any account' });
        
        user.generatePasswordReset();

        await user.save();

        let subject = "password reset change";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}</p>
                    <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
        
        await sendEmail({ to, from, subject, email });

        res.status(200).json({ message: 'A reset email has been sent to ' + user.email + '.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

api.post('api/auth/reset', async (req, res) => {
        try {
        const { token } = req.body;

        const user = await user.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user)
            return res.status(401).json({ message: 'Password reset token is invalid or expired;' })
        
        res.render('reset', {user})
        } catch (error) {
            res.status(500).json({ message: error.message });
    }
})


