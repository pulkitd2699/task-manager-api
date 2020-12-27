const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//User Model
//behind the scenes the object passed in model is converted to Schema
//we'll make a new schema of the object prehand to take advantage of middleware which is specified on schema level (so obvios...)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot be "password"')
            }
        }
    },  
    age: {
        type: Number,
        default: 16,
        validate(value){
            if(value < 16){
                throw new Error('Age must be greater than equal to 16')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
}) 

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//not arrow function because we need this binding to bind to a single user (i.e the instance of User collection)
userSchema.methods.generateAuthToken = async function () {
    const user = this
    //syntax => sign(payload, secret) 
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET) 
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

//toJSON gets called whenever the object gets stringified which is in every case response is send back
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.statics.findByCredentials = async (email, pass) => {
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(pass, user.password)

    if(!isMatch){
        throw new Error('Unable to login!')
    }

    return user
}

//hash the plain text pass before saving
userSchema.pre('save', async function (next) {
    const user = this

    // console.log('just before saving!')
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    //next tells that the part of running some code before (pre) save operation is done and we can continue
    next()
})

//delete user tasks when user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User