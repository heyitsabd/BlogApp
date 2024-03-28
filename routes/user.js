const express = require('express');
const User = require('../models/user');
const { mongoose } = require('mongoose');
const router = express.Router();

// router.get('/home',(req,res)=>{
//     res.render('')
// })

router.get('/signin',(req,res)=>{
    return res.render('signin')
});

router.get('/signup',(req,res)=>{
    return res.render('signup')
})

router.post('/signup',async(req,res)=>{
    const {fullName,email,password} = req.body;
    await User.create({
        fullName,
        email,
        password
    });
    return res.redirect('/')
})

router.post('/signin',async(req,res)=>{
    const {email,password} = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email,password);

        return res.cookie("Token",token).redirect('/')
    } catch (error) {
        res.render('signin',{
            error:'Incorrect email or password'
        })
    }
})

router.get('/logout',(req,res)=>{
    res.clearCookie('Token').redirect('/')
})


module.exports = router