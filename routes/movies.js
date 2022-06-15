const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const Director = require('../models/director')
const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image.png', 'image/gif']

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
        res.redirect(`movies`)
        console.log('submitted')
        /* res.redirect(`movies/${newMovie.id}`) */
    } catch (err) {
        console.log(err)
        renderNewPage(res, movie, true)
    }
})

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
function saveCover(movie, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, 'base64')
        movie.coverImageType = cover.type
    }
}

module.exports = router