const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path')
const {Blog} = require('../models/blog');
const {Comment} = require('../models/comment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {                 //cb- callback
      cb(null, path.resolve('./public/images/uploads'))
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`
        cb(null,filename);
    },
  });

  const upload = multer({ storage: storage })

  router.post('/',upload.single('coverImage'),async (req,res)=>{
    const {title, body} = req.body;
    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImage: `/uploads/${req.file.filename}`
    });
    return res.redirect(`/blog/${blog._id}`)
 })
 
 router.get('/add-new',(req,res)=>{
    return res.render('addblog',{
        user:req.user,
    })
})

router.get('/:id',async(req,res)=>{
  const blog = await Blog.findById(req.params.id).populate('createdBy')
  const comments = await Comment.find({blogId:req.params.id}).populate('createdBy')
  return res.render('blog',{
    user:req.user,
    blog,
    comments
  })
})

router.post('/comment/:blogId', async(req,res)=>{
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})


// router.get('/:id',async(req,res)=>{
 
//   return res.render('blog',{
//     comments,
//     user:req.user
//   })
// })

module.exports=router;