const router = require('./auth').router
const e = require('express')
const db = require('../util/database')

const checkAuthenticated = require('./auth').checkAuthenticated

router.get('/cart/add/:id', checkAuthenticated, (req, res) => {
    var product_id = req.params.id

    
})







module.exports = router