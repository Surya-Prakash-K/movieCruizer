const express = require('express')
const router = express.Router()
const Director = require('../models/director')
const Movie = require('../models/movie')


//new director route
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
        res.redirect(`movies/new`)
    } catch (e) {
        res.render('directors/new', {
            director: director,
            errorMessage: 'Error creating Director'
        })
    }
})


//route for getting directors with specific id /2721482128e81
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

})

//route for editing director with id
router.get('/:id/edit', async (req,res) => {
    try{
       const director = await Director.findById(req.params.id) 
       res.render('directors/edit', { director: director })
    }catch{
       res.redirect('/directors')
    }
    
})

//route for updating director with id
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

//route for deleting a director with id
router.delete('/:id', async(req,res) => {
    let director
    try {
        director = await Director.findById(req.params.id)
        await director.remove()
        res.redirect('/movies/new')
    } catch {
        if(director == null){
            res.redirect('/')
        }else{
            res.redirect(`/directors/${director.id}`)
        }
        
    }})

//exporting the director router to server.js file  
module.exports = router