if(process.env.NODE_ENV != 'production'){
  require('dotenv').config()  
}
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const indexRouter = require('./routes/index')
const directorRouter = require('./routes/directors')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose  = require('mongoose')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public')) 
app.use(bodyParser.urlencoded({limit : '10mb', extended : false }))

app.use('/',indexRouter)
app.use('/directors',directorRouter)


const DATABASE_URL = 'mongodb+srv://movieCruizer:test123@moviecruizer.j3fihwg.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(DATABASE_URL,{useNewUrlParser : true})
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',()=> console.log('connected to Mongoose'))


app.listen(process.env.PORT || 3000)