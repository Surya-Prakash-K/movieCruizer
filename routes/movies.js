const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const Director = require('../models/director')
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

//all movies route
router.get('/', async (req, res) => {
    let query = Movie.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try {
        const movies = await query.exec()
        res.render('movies/index', {
            movies: movies,
            searchOptions: req.query
        })
    }
    catch {
        res.redirect('/')
    }
})


//new movies route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Movie())
})


//create movie route
router.post('/', async (req, res) => {

    const movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        releaseDate: new Date(req.body.releaseDate),
        runTime: req.body.runTime,
        description: req.body.description

    })
    saveCover(movie, req.body.cover)
    try {
        const newMovie = await movie.save()
        console.log('submitted')
        res.redirect(`movies/${newMovie.id}`) 
    } catch (err) {
        console.log(err)
        renderNewPage(res, movie, true)
    }
})

//show Movie Route
router.get('/:id', async (req,res)=>{
  try{
      const movie = await Movie.findById(req.params.id)
                               .populate('director')
                               .exec()
      res.render('movies/show',{movie : movie})
  }catch{
      res.redirect('/')
  }
})

//edit Movie Route
router.get('/:id/edit', async (req, res) => {
    try{
     const movie = await Movie.findById(req.params.id)
     
      renderEditPage(res, movie)
    }catch{
        res.redirect('/')
    }
})


//Update Movie Route
router.put('/:id', async (req, res) => {

    let movie 
    try {
        movie = await Movie.findById(req.params.id)
        movie.title = req.body.title
        movie.director = req.body.director
        movie.releaseDate = new Date(req.body.releaseDate)
        movie.runTime = req.body.runTime
        movie.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(movie,req.body.cover)
        }
        await movie.save()
        res.redirect(`/movies/${movie.id}`)
    } catch {
        if(movie != null){
              renderEditPage(res, movie, true)
        }else{
            redirect('/')
        }
        
    }
})

//delete Movie Route
router.delete('/:id', async(req,res)=>{
    let movie 
    try{
        movie = await Movie.findById(req.params.id)
        await movie.remove()
        res.redirect('/movies')
    }catch{
        if( movie != null){
           res.render('movies/show',{
               movie : movie,
               errorMessage : 'Could not remove movie'
           }) 
        }else{
            res.redirect('/')
        }
    }
})


async function renderNewPage(res, movie, hasError = false) {
    renderFormPage(res,movie,'new',hasError)
}


async function renderEditPage(res, movie, hasError = false) {
    renderFormPage(res,movie,'edit',hasError)
}


async function renderFormPage(res, movie, form, hasError = false) {
    try {
        const directors = await Director.find({})
        const params = {
            directors: directors,
            movie: movie
        }
        if(hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error Updating Movie'
            }else{
                params.errorMessage = 'Error Creating Movie' 
            }
        }
        res.render(`movies/${form}`, params)
    }
    catch {
        res.redirect('/movies')
    }
}


function saveCover(movie, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, 'base64')
        movie.coverImageType = cover.type
    }
}

module.exports = router