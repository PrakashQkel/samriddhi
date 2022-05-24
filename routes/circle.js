
const router = require('./auth').router
const e = require('express')
const db = require('../util/database')

const checkAuthenticated = require('./auth').checkAuthenticated

router.get('/circle/register', checkAuthenticated, (req, res, next) => {
    res.render('register_circle', {user: req.user})
})

router.post('/circle/register', checkAuthenticated, (req, res, next) => {
    //take values from form and insert into database
    try {
        const circle_type = req.body.circle_type
        const circle_name = req.body.circle_name
        const lat = req.body.lat
        const lng = req.body.lng
        const desc = req.body.description

        db.query("insert into CIRCLE(C_Type, Name, Latitude, Longitude, Description) values ('"+circle_type+"','"+circle_name+"','"+lat+"','"+lng+"', '"+desc+"')")
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.render('register_circle')
    }
    //atleast 5 individuals must approve of the circle to be valid
})

router.get('/circle/join', checkAuthenticated, (req, res, next) => {
    //check if user is already a member of a circle
    db.query("select * from USER_CIRCLE uc, CIRCLE c where uc.Circle_ID=c.Circle_ID and uc.User_ID = "+req.user.User_ID, (err, rows) => {
        if(rows[0]){
            res.render("join_circle", {user: req.user, message: "You are already a member of <b>"+rows[0].Name+"</b> circle."})
        }
        else{
             //retrieve details about circle based on proximity from the database
            const lat = parseFloat(req.query.lat)
            const lng = parseFloat(req.query.lng)

            console.log(lat)

            db.query("select * from circle", (err, rows) => {
                var proximal_circles = []
                for(var i=0; i<rows.length; i++){
                    if(insideCircle(lat, lng, Number(rows[i]["Latitude"]), Number(rows[i]["Longitude"]))){
                        rows[i].Distance = distance(lat, lng, Number(rows[i]["Latitude"]), Number(rows[i]["Longitude"]))
                        proximal_circles.push(rows[i])
                    }
                }
                // console.log(proximal_circles[0].Name)
                // console.log(proximal_circles[0].Latitude)
                // console.log(proximal_circles[0].Longitude)
                // console.log(proximal_circles[0].C_Type)
                res.render('join_circle',  {user: req.user, proximal_circles: proximal_circles})
            })
        }
    })
})

router.post('/circle/join', checkAuthenticated, (req, res, next) => {
    //admit user to the circle. Must be accepted by atleast 3 members of the circle
    console.log(req.user.User_ID)

    db.query("insert into USER_CIRCLE(Circle_ID, User_ID) values('"+req.body.Circle_ID+"', '"+req.user.User_ID+"')")

    res.redirect('/')
})

router.get('/circle/leave', checkAuthenticated, (req, res, next) => {
    db.query("delete from USER_CIRCLE where User_ID = "+req.user.User_ID)

    res.redirect('/')
})

function insideCircle (h, k, x, y){
    const radius = 50
    var center = latLngToXY(h, k)
    var point = latLngToXY(x, y)

    //console.log("Distance = "+ Math.sqrt((center.x-point.x)**2+(center.y-point.y)**2))

    return ((center.x-point.x)**2+(center.y-point.y)**2) < radius**2
}

function distance (h, k, x, y){
    var center = latLngToXY(h, k)
    var point = latLngToXY(x, y)

    return Number((Math.sqrt((center.x-point.x)**2+(center.y-point.y)**2)).toFixed(1))
}

function latLngToXY (lat, lng){
    const degToRad = Math.PI / 180.0
    const radiusOfEarth = 6357.0
    const lat0 = Math.cos(lat*degToRad)

    var x = radiusOfEarth*lng*degToRad*lat0
    var y = radiusOfEarth*lat*degToRad
    
    return {x, y}
}

module.exports = router