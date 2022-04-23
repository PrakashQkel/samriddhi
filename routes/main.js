const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../util/database')

router.get('/', (req, res, next) => {
    res.render('home')
})

router.get('/login', (req, res, next) => {
    res.render('login')
})

router.get('/signup', (req, res, next) => {
    res.render('signup')
})

router.post('/signup', async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const pass = req.body.pass
        const re_pass = req.body.re_pass

        if(pass != re_pass){
            console.log("Passwords donot match!")
            res.redirect('/signup')
        }
        
        else{
            const hashedPwd = await bcrypt.hash(req.body.pass, 10)
            db.query("insert into USER(name, email, pass) values('"+name+"', '"+email+"', '"+hashedPwd+"');", (err) => {
                if(err){
                    console.log("Email already in use")
                    res.redirect('/signup')
                }
                else {
                    console.log("Registered")
                    res.redirect('/login')
                }
            })
        }
        
        

    } catch (error) {
        console.log(error)
        res.redirect('/signup')
    }
})


module.exports = router