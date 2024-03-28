require('dotenv').config()
const express = require('express')
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path')
const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/auth');
const {Blog} = require('./models/blog')

mongoose.connect(process.env.MONGO_URL)
        .then(console.log('MongoDb is connected'))


app.set('view engine','ejs')
app.set('views', path.resolve('./views'))
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie('Token'))
app.use(express.static(path.resolve('./public')))        //Imp middleware for image rendering
app.use(express.static(path.resolve('./public/images')))        //Imp middleware for image rendering

app.get('/', async(req,res)=>{
    const allBlog = await Blog.find({})
    res.render('home',{
        user:req.user,
        blogs : allBlog
    })
})


app.use('/user',userRoute)
app.use('/blog',blogRoute)




app.listen(PORT,console.log(`App started at PORT no. ${PORT}`))
