// Full Documentation - https://docs.turbo360.co
const vertex = require('vertex360')({ site_id: process.env.TURBO_APP_ID })
const express = require('express')

const app = express() // initialize app

const config = {
  views: 'views', // Set views directory
  static: 'public', // Set static assets directory
  logging: true,

  /*  To use the Turbo 360 CMS, from the terminal run
      $ turbo extend cms
      then uncomment line 21 below: */

  // db: vertex.nedb()
}
vertex.configureApp(app, config)


const auth = require('./routes/auth').router
app.use('/', auth)

const circle = require('./routes/circle')
app.use('/', circle)

const product = require('./routes/product')
app.use('/', product)

const cart = require('./routes/cart')
app.use('/', cart)

app.use(express.urlencoded({extended : false}))

module.exports = app
