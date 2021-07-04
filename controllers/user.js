const User = require('../models/user');
const { uploader, sendEmail } = require('../utils/index');
const express = require('express');
const user = require('../models/user');

let api = router();

api.get('admin/user', async (req, res) => {
    const users = await User.find({});
    res.status(200).json({ users });
});

api.post('/', async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure this account doesnt already exist
        const user = await User.findOne({ email });
        if (user)
            return res.status(401).json({ message: 'The email address you entered is associated with another account' });
        
        const password = '_' + Math.random().toString(36).substr(2.9); // Generate a random password
        const newUser = new User({ ...req.body, password });

        const user_ = await newUser.save();

        user_.generatePasswordReset();

        await user._save;

        //Get mail options
        let domain = "http://" + req.headers.host;
        let subject = "New Account Created";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`
        
        await sendEmail({ to, from, link, html });

        res.status(200).json({message: 'An email has been sent to ' + user.email + '.'});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); 
    }
})

api.get('api/user/{id}', async (req, res) => {
    try {
        const id = req.params.id;

        const user = await user.findById(id);

        if (!user)
            return res.status(401).json({ message: 'User does not exist' })
        
        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({message: error.message})
    } 
})

api.put('/api/user/{id}', async (req, res) => {
    try {
        const update = req.body;
        const id = req.params.id;
        const userId = req.user._id;

        //Make sure the passed id is that of the logged in user
        if (userId.toString() !== id.toString())
            return res.status(401).json({ message: "Sorry, you don't have the permission to up this data." });
        
        const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true });
        
        //if there is no image, return success message
        if (!req.file)
            return res.status(200).json({ user, message: 'User has been updated' });
        
        //Attempt to upload to cloudinary
        const result = await uploader(req);
        const user_ = await User.findByIdAndUpdate(id, { $set: update }, { $set: { profileImage: result.url } }, { new: true });
        
        if (!req.file)
            return res.status(200).json({ user: user_, message: 'User has been updated' })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

api.del('/api/user/{id}', async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.params.user_id;

        if (user_id.tostring() !== id.toString())
            return res.status(401).json({ message: "Sorry, you dont have permission to delete this data." })
        await User.findByIdAndDelete(id);
        res.status(200).json({message: "User has been deleted"})
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
    
})

