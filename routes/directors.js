const express = require('express')
const router = express.Router()
const Director = require('../models/director')

router.get('/',(req,res) =>{
    res.render('directors/index')
})

router.get('/new',(req,res) =>{
    res.render('directors/new', { director : new Director() })
})
router.post('/',(req,res) =>{
    res.send(req.body.name)
})
module.exports = router