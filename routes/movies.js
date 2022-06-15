const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Movie = require('../models/movie')
const uploadPath = path.join('public', Movie.coverImageBasePath)
const Director = require('../models/director')

const imageMimeTypes = ['image/jpeg','image/jpg','image/png','image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//all movies route
router.get('/', async (req, res) => {
    let query = Movie.find()
    if(req.query.title != null && req.query.title !=''){
        query= query.regex('title',new RegExp(req.query.title ,'i') )
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
      }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try{
        const movies = await query.exec()
        res.render('movies/index',{
            movies : movies,
            searchOptions :req.query
        })
    }catch{
         res.redirect('/')
    }
})

//new movies route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Movie())
})

//create movie route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const movie = new Movie({
        title : req.body.title,
        director : req.body.director,
        releaseDate : new Date(req.body.releaseDate),
        runTime : req.body.runTime,
        coverImageName : fileName,
        description : req.body.description
    })
    try {

        const newMovie = await movie.save()

        res.redirect(`movies`)
        console.log('submitted')
        /* res.redirect(`movies/${newMovie.id}`) */
    } catch (err){
        if(movie.coverImageName != null){
          removeBookCover(movie.coverImageName)
        } 
        renderNewPage(res, movie, true)
    }
})
function removeBookCover(fileName){
   fs.unlink(path.join(uploadPath,fileName), err =>{
       if(err) console.error(err)
   })
} 
async function renderNewPage(res, movie, hasError = false) {
    try {
        const directors = await Director.find({})
        const movie = new Movie()
        const params = {
            directors: directors,
            movie: movie
        }
        if (hasError) params.errorMessage = 'Error creating movie '
        res.render('movies/new', params)
    }
    catch {
        res.redirect('/movies')
    }
}

module.exports = router