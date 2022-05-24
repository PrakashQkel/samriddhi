const router = require('./auth').router
const e = require('express')
const db = require('../util/database')
const path = require('path')
const fs = require('fs')

const checkAuthenticated = require('./auth').checkAuthenticated

const multer = require("multer");

const upload = multer({
  dest: "C:/Users/user/Documents/GitHub/samriddhi/public/images/uploads/temp"
});

router.get('/product/add', checkAuthenticated, (req, res, next) => {
    res.render('add_product', {user: req.user})
})

router.post('/product/add', checkAuthenticated, upload.single("product-img"), (req, res, next) => {
    //adding product to database
    const tempPath = req.file.path;
    const product_name = req.body.product_name
    const price = parseFloat(req.body.price)
    const desc = req.body.description

    console.log(tempPath)
    console.log(product_name)
    console.log(price)
    console.log(desc)
    
    
    db.query("insert into PRODUCT(User_ID, P_Name, Price, Description) values ("+req.user.User_ID+",'"+product_name+"', "+price+", '"+desc+"')")
    db.query("update PRODUCT set Image_path = concat('image', Product_ID, '.png') where Product_ID = LAST_INSERT_ID();")
    

    db.query("select Image_path from PRODUCT where Product_ID = LAST_INSERT_ID();", (err, row) => {
        const img = row[0].Image_path

        const targetPath = "C:/Users/user/Documents/GitHub/samriddhi/public/images/uploads/"+img

        //for parsing the image and saving in the directory
        fs.rename(tempPath, targetPath, err => {
            if (err) return handleError(err, res);

            res.redirect('/')
        })
    })
})

router.get('/product/show', checkAuthenticated, (req, res, next) => {
    db.query("select * from PRODUCT", (err, rows) => {
        var products = []
        for(var i=0; i<rows.length; i++){
            products.push(rows[i])
        }
        
        res.render('show_product',  {user: req.user, products: products})
    })
})

module.exports = router