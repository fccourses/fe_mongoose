const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const yup = require('yup')

const {Schema} = mongoose

const PORT = process.env.PORT || 3000
const DB_NAME = process.env.DB_NAME || 'fe_mongoose'
const emailValidationSchema = yup.string().email().required()

mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch((err) => {
    console.log(err)
    process.exit(1)
})

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /[A-ZА-Яa-zа-я]{2,32}/.test(v)
        }
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (v) => emailValidationSchema.isValid(v)
        }
    },
    isMale: {
        type: Boolean,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    birthday: {
        type: Date,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
})

const postSchema = new Schema({
    body: String,
    imgSrc: String,
    author: {type: Schema.Types.ObjectId, ref: 'users'},
}, {
    versionKey: false,
    timestamps: true,
})

const User = mongoose.model('users', userSchema)
const Post = mongoose.model('posts', postSchema)

const app = express()

app.use(express.json())

app.post('/', async (req, res, next) => {
    try {
        const {body} = req
        const newUser = await User.create(body)
        res.send(newUser)
    } catch (e) {
        next(e)
    }
})

app.get('/', async (req, res, next) => {
    const users = await User.find()
    res.send(users)
})

app.patch('/:userId', async (req, res, next) => {
    try {
        const {body, params: {userId}} = req
        const updatedUser = await User.findOneAndUpdate({_id: userId}, body, {new: true})
        res.send(updatedUser)
    } catch (err) {
        next(err)
    }
})

app.delete('/:userId', async (req, res, next) => {
    try {
        const {params: {userId}} = req
        const deletedUser = await User.findByIdAndRemove(userId)
        if (deletedUser) {
            return res.send(deletedUser)
        }
        res.sendStatus(404)
    } catch (err) {
        next(err)
    }
})

app.post('/:userId/posts', async (req, res, next) => {
    try {
        const {params: {userId}, body} = req
        const createdPost = await Post.create({...body, author: userId})
        res.send(createdPost)
    } catch (err) {
        next(err)
    }
})

app.get('/posts', async (req, res, next) => {
    try {
        const {params: {userId}} = req
        Post.find()
            .populate('author')
            .exec((err, posts) => {
                if (err) {
                    throw err
                }
                res.send(posts)
            })

    } catch (err) {
        next(err)
    }
})

const server = http.createServer(app)


server.listen(PORT, () => console.log('Started'))