const express = require('express')
const router = express.Router()
const Director = require('../models/director')
const Movie = require('../models/movie')

//all directors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name !== null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const directors = await Director.find(searchOptions )
        res.render('directors/index', {
            directors: directors,
            searchOptions: req.query
        })
    } catch {
        res.render('/')
    }
})

//new directors route
router.get('/new', (req, res) => {
    res.render('directors/new', { director: new Director() })
})

//create director route
router.post('/', async (req, res) => {
    const director = new Director({
        name: req.body.name
    })
    try {
        const newDirector = await director.save()
        res.redirect(`directors/${newDirector.id}`)
    } catch (e) {
        res.render('directors/new', {
            director: director,
            errorMessage: 'Error creating Director'
        })
    }
})

router.get('/:id' , async(req,res ) => {
    try{
       const director = await Director.findById(req.params.id)
       const movies = await Movie.find({director : director.id}).limit(4).exec()
       res.render('directors/show',{
           director : director,
           moviesByDirector : movies
       })
    }catch{
        res.redirect('/')
    }
    res.send('Show Director '+ req.params.id)
})

router.get('/:id/edit', async (req,res) => {
    try{
       const director = await Director.findById(req.params.id) 
       res.render('directors/edit', { director: director })
    }catch{
       res.redirect('/directors')
    }
    
})

router.put('/:id',async(req,res) => {
    let director
    try {
        director = await Director.findById(req.params.id)
        director.name = req.body.name
        await director.save()
        res.redirect(`/directors/${director.id}`)
    } catch (e) {
        if(director == null){
            res.redirect('/')
        }else{
            res.render('directors/edit', {
            director: director,
            errorMessage: 'Error updating Director'
        })
        }
        
    }
}) 

router.delete('/:id', async(req,res) => {
    let director
    try {
        director = await Director.findById(req.params.id)
        await director.remove()
        res.redirect('/directors')
    } catch {
        if(director == null){
            res.redirect('/')
        }else{
            res.redirect(`/directors/${director.id}`)
        }
        
    }})

module.exports = router