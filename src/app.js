const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()

//without middleware: new request -> run route handler
//with middleware: new request -> do something -> run route handler
//to setup a middleware on a particular route pass it as an arg to the http method before the arg 'route handler'

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app
