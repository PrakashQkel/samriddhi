const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { authenticate } = require('passport')
const db = require('../util/database')

//login using email
function initialize(passport){

    const authenticateUser = async (email, password, done) => {
        
        db.query("select * from USER where email = '"+email+"'", async (err, rows)=>{

            user = rows[0]
            //console.log(user)

            if(user == null){
                console.log('No user found with that email!')
                return done(null, false, {message: 'No user found with that email!'})
            }
    
            try {
                if(await bcrypt.compare(password, user.pass)){
                    return done(null, user)
                }
                else{
                    console.log('Incorrect')
                    return done(null, false, {message: 'Incorrect password!'})
                }
            } catch (error) {
                return done(error)
            }
        })
    }

    passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, authenticateUser))

    passport.serializeUser((user, done) => done(null, user.User_ID))

    passport.deserializeUser((id, done) => {
        var data
        db.query("select * from USER where User_ID = "+id, (err, rows)=>{
            data = rows[0]
            return done(null, data)
        })
    })
}

//login using facebook
const FacebookStrategy = require('passport-facebook').Strategy

function initializeFacebookPassport(passport){
    passport.use(new FacebookStrategy({
        clientID: '565515104834083', 
        clientSecret: '05ff505cd421e9a2c79aacdbeb43c060', 
        callbackURL: 'http://localhost:3000/auth/facebook/callback'},
        (accessToken, refreshToken, profile, done) => done(null, profile)
    ))

    passport.serializeUser((user, done) => {
        done(null, user);
    });
      
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
}

module.exports = {
    initializeLocal : initialize,
    initializeFacebook : initializeFacebookPassport
}


