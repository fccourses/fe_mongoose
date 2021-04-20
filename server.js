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
})

const User = mongoose.model('users', userSchema)

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


const server = http.createServer(app)


server.listen(PORT, () => console.log('Started'))