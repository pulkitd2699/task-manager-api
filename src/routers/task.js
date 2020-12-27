const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()

//rest api endpoints for creating resources
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)

    // })

    try{
        await task.save()
        res.status(201).send(task)

    } catch(e){
        res.status(400).send(e)
    }
})

//rest api endpoints for reading resources (multiple tasks)
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=10 //second page //pagination
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = (req.query.completed === 'true')
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] === 'desc') ? -1 : 1
    }

    try{
        //one way is this
        // const tasks = await Task.find({owner: req.user._id})
        //res.send(tasks)

        //another way is to populate
        await req.user.populate({
            path: 'tasks',
            match,
            //options is used for pagination and sorting
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)

    } catch(e){
        res.status(500).send()
    }
})

//rest api endpoints for reading resources (single task)
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }

        res.send(task)

    } catch(e){
        res.status(500).send()
    }
})

//updating existing resource (individual task)
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try{
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)

    } catch(e){
        res.status(400).send(e)
    }
})

//delete existing resource (task)
router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)

    } catch(e){
        res.status(500).send()
    }
})

module.exports = router