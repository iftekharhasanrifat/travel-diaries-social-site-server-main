const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = `${process.env.JWT}`
const protected = require('../access/access')

router.get('/authorized',protected, (req, res) => {
  res.send("Hello auth")
})

router.post('/signup', (req, res) => {

  const {
    name,
    email,
    password,
    pic
  } = req.body
  if (!email || !password || !name) {
    return res.status(422).json({
      error: "Please complete all the fields"
    })
  }
  User.findOne({
      email: email
    })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({
          error: "An User has already existed with this email"
        })
      }
      bcrypt.hash(password, 12)
        .then(pass => {
          const user = new User({
            name,
            email,
            password: pass,
            pic
          })
          user.save()
            .then(user => {
              res.json({
                message: "User successfully Saved"
              });
            })
            .catch(err => {
              console.log(err);
            })
        })

    })
    .catch(err => {
      console.log(err);
    })
})

router.post('/signin',(req,res)=>{
  const {email,password} = req.body
  if(!email || !password){
     return res.status(422).json({error:"Invalid Email or password"})
  }
  User.findOne({email:email})
  .then(savedUser=>{
      if(!savedUser){
         return res.status(422).json({error:"Invalid Email or password"})
      }
      bcrypt.compare(password,savedUser.password)
      .then(isMatch=>{
          if(isMatch){
             const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
             const {_id,name,email,followers,following,pic} = savedUser
             res.json({token,user:{_id,name,email,followers,following,pic}})
          }
          else{
              return res.status(422).json({error:"Invalid Email or password"})
          }
      })
      .catch(err=>{
          console.log(err)
      })
  })
})
router.post('/reset-password',(req,res)=>{
  crypto.randomBytes(32,(err,buffer)=>{
      if(err){
          console.log(err)
      }
      const token = buffer.toString("hex")
      User.findOne({email:req.body.email})
      .then(user=>{
          if(!user){
              return res.status(422).json({error:"User dont exists with that email"})
          }
          user.resetToken = token
          user.expireToken = Date.now() + 3600000
          user.save().then((result)=>{
              transporter.sendMail({
                  to:user.email,
                  from:"no-replay@insta.com",
                  subject:"password reset",
                  html:`
                  <p>You requested for password reset</p>
                  <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                  `
              })
              res.json({message:"check your email"})
          })

      })
  })
})


router.post('/new-password',(req,res)=>{
 const newPassword = req.body.password
 const sentToken = req.body.token
 User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
 .then(user=>{
     if(!user){
         return res.status(422).json({error:"Try again session expired"})
     }
     bcrypt.hash(newPassword,12).then(hashedpassword=>{
        user.password = hashedpassword
        user.resetToken = undefined
        user.expireToken = undefined
        user.save().then((saveduser)=>{
            res.json({message:"Password changed"})
        })
     })
 }).catch(err=>{
     console.log(err)
 })
})

module.exports = router