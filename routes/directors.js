const express = require('express')
const router = express.Router()
const Director = require('../models/director')

//all directors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name !== null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    /* searchOptions = { name: RegExp(req.query.name, 'i')} */
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
        res.redirect(`directors`)
    } catch (e) {
        res.render('directors/new', {
            director: director,
            errorMessage: 'Error creating Director'
        })
    }
})

module.exports = router