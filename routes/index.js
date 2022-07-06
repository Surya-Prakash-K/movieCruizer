const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/user')

router.get('/',checkAuthenticated,async (req,res) =>{
    let movies 
    try{
      movies = await Movie.find().sort({ createdAt : 'desc' }).limit(10).exec()
    }catch {
      movies = []
    }
    res.render('index.ejs',{movies : movies})
})

const initializePassport = require('../passport-config');
initializePassport(
    passport,
    email => User.findOne({email : email}),
    id => User.findOne({id : id})
)

router.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('users/login.ejs')
})

router.post('/login', checkNotAuthenticated,passport.authenticate('local',{
  successRedirect : '/',
  failureRedirect : '/login',
  failureFlash : true
}))

router.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('users/register.ejs')
})

router.post('/register',checkNotAuthenticated,async(req,res)=>{
   try{
     const hashedPassword = await bcrypt.hash(req.body.password,10)
     const users = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword
     })
     users.save();
     res.redirect('/login')
     console.log(users)
   }catch(e){
     console.log(e)
     res.redirect('/register')
   }
   
})

router.delete('/logout', function(req,res,next){
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  })
})

function checkAuthenticated(req,res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next ()
}




module.exports = router