require("dotenv").config()
const express=require('express')
const cors=require('cors')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const paymentRoutes=require("./routes/Payment")
const { connectToDB } = require("./database/db")
const path = require('path')
const fs = require('fs')
const multer = require('multer')


// server init
const app = express()

// database connection
connectToDB()


// middlewares
app.use(cors({origin:process.env.ORIGIN,credentials:true,exposedHeaders:['X-Total-Count'],methods:['GET','POST','PATCH','DELETE']}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("tiny"))

// routeMiddleware
app.use("/auth",authRoutes)
app.use("/users",userRoutes)
app.use("/products",productRoutes)
app.use("/orders",orderRoutes)
app.use("/cart",cartRoutes)
app.use("/brands",brandRoutes)
app.use("/categories",categoryRoutes)
app.use("/address",addressRoutes)
app.use("/reviews",reviewRoutes)
app.use("/wishlist",wishlistRoutes)
app.use('/payments', paymentRoutes)

// chat routes
const chatRoutes = require('./routes/Chat')
app.use('/chat', chatRoutes)

// API chat persistence routes (do not remove existing routes)
const apiChatRoutes = require('./routes/ApiChat')
app.use('/api', apiChatRoutes)

// static uploads folder
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
app.use('/uploads', express.static(uploadsDir))

// multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})
const upload = multer({ storage })

// simple upload endpoint: accepts single file with field name 'file'
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' })
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        return res.status(201).json({ url })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error uploading file' })
    }
})



app.get("/",(req,res)=>{
        res.status(200).json({message:'running'})
})

// create http server and attach socket.io
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET','POST'],
    credentials: true
  }
})

// expose io globally so controllers can broadcast without circular imports
global.io = io

// attach chat socket handlers (isolated)
const attachChatSocket = require('./socket/chatSocket')
attachChatSocket(io)

const port=process.env.PORT || 8000;


server.listen(port,()=>{
    console.log('server [STARTED] on port '+port);
})