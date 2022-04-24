const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { authenticate } = require('passport')
const db = require('../util/database')

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

    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser((id, done) => {
        var data
        db.query("select * from USER where id = "+id, (err, rows)=>{
            data = rows[0]
            return done(null, data)
        })

    })
}

module.exports = initialize



