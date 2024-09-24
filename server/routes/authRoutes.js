const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});

        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();


        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, { expiresIn: '1h'});

        res.status(201).json({token, user: {id: newUser._id, name, email}})
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }

});



router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message:'Invalid credentials'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'1h'});

        res.json({token, user: {id: user._id, name: user.name, email:user.email}});
    } catch (error) {
        res.status(500).json({message:'Server error'});
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
})

module.exports = router;