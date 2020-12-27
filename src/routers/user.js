const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
const { route } = require('./task')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')
const router = new express.Router()

//rest api endpoints for creating resources
//route for signing up a user
router.post('/users', async (req, res) => {
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
    
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
})

//route for logging in a user
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})

    } catch(e) {
        res.status(400).send()
    }
})

//route to logout of one session
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } 
    catch(e) {
        res.status(500).send()
    }
})

//route to logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

//rest api endpoints for reading resources (multiple users)
//this is for education purpose
// router.get('/users', auth, async (req, res) => {
//     // User.find({}).then((users) => {
//     //     res.send(users)
//     // }).catch((e) => {
//     //     res.status(500).send()
//     // })

//     try{
//         const users = await User.find({})
//         res.send(users)
//     } catch(e){
//         res.status(500).send()
//     }
// })

//route to view your own profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


//updating existing resource (individual user)
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try{
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // below way allows us to use middleware

        // const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)

    } catch(e){
        res.status(400).send(e)
    }
})

//delete existing resource (user)
router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)

    } catch(e){
        res.status(500).send()
    }
})

//uploading a profile pic of user

const upload = multer({
    //on removing the dest property from upload the file is transferred to the callback on route handler and accessible on req.file
    // dest: 'avatars',
    limits: {
        fileSize: 1000000 //in bytes
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const modifiedBuffer = await sharp(req.file.buffer).resize({width: 500, height: 500}).png().toBuffer()
    req.user.avatar = modifiedBuffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//deleting the upload
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//serving avatar
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router