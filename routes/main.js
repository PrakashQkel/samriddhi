const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../util/database')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('../util/passport_config').initializeLocal
const initializeFacebookPassport = require('../util/passport_config').initializeFacebook

async function getUserByEmail(email){
    var user
    //read query
    db.query("select * from USER where email = '"+email+'"', (err, rows) => {
        user = rows[0]
    })
    return await user
}

initializePassport(passport)
initializeFacebookPassport(passport)


router.use(express.urlencoded({extended : false}))
router.use(flash())
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))


router.get('/', checkAuthenticated, (req, res, next) => {
    res.render('home', {user: req.user})
    console.log(req.user)
})

router.get('/index', checkNotAuthenticated, (req, res, next) => {
    res.render('index')
})

router.get('/login', checkNotAuthenticated, (req, res, next) => {
    res.render('login')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
     successRedirect: '/',
     failureRedirect: '/index',
     failureFlash: true,
}))

router.get('/auth/facebook', checkNotAuthenticated, passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}))

router.get('/auth/facebook/callback', checkNotAuthenticated, passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login',
}))

router.get('/signup', checkNotAuthenticated, (req, res, next) => {
    res.render('signup')
})

router.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const pass = req.body.pass
        const re_pass = req.body.re_pass

        if(pass != re_pass){
            console.log("Passwords donot match!")
            res.render('index', {error: 'Passwords do not match!'})
        }
        
        else{
            const hashedPwd = await bcrypt.hash(req.body.pass, 10)
            //write query
            db.query("insert into USER(name, email, pass) values('"+name+"', '"+email+"', '"+hashedPwd+"');", (err) => {
                if(err){
                    console.log("Email already in use")
                    res.render('index', {error: 'Email already in use'})
                }
                else {
                    console.log("Registered")
                    res.redirect('/')
                }
            })
        }
        
    } catch (error) {
        console.log(error)
        res.redirect('/index')
    }
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/index')
})

router.get('/twitter', (req, res) => {
    res.redirect("https://www.twitter.com")
})
router.get('/facebook', (req, res) => {
    res.redirect("https://www.facebook.com")
})
router.get('/linkedin', (req, res) => {
    res.redirect("https://www.linkedin.com")
})
router.get('/whatsapp', (req, res) => {
    res.redirect("https://www.whatsapp.com")
})
router.get('/instagram', (req, res) => {
    res.redirect("https://www.instagram.com")
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()) 
        return next()

    res.redirect('/index')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated())
        res.redirect('/')

    next()
}

module.exports = router