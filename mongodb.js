//CRUD operations => Create Read Update Delete
//Mongoose => user authentication, validation of fields in documents
//ODM - Object Document Mapper (Mongoose map object of model to a document)

// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID

const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectID()
// console.log(id.getTimestamp())

MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
    if(error){
        return console.log('Unable to connect to database')
    }
    // console.log('Connected Correctly')
    const db = client.db(databaseName)

    //C - Create *********************

    //inserting 1 document in a collection
    // db.collection('users').insertOne({
    //     name: 'Pulkit',
    //     age: 21
    // }, (error, result) => {
    //     if(error){
    //         return console.log('Unable to insert user')
    //     }
    //     //ops is an array of all the documents in the collection
    //     console.log(result.ops)
    // })

    //inserting multiple documents in a collection
    // db.collection('users').insertMany([
    //     {
    //         name: 'Omen',
    //         age: 20
    //     },
    //     {
    //         name: 'Skye',
    //         age: 20
    //     }
    // ], (error, result) => {
    //     if(error){
    //         return console.log('Unable to insert documents!')
    //     }
    //     console.log(result.ops)
    // })

    // db.collection('tasks').insertMany([
    //         {
    //             description: 'Clean the house',
    //             completed: true
    //         },
    //         {
    //             description: 'Renew inspection',
    //             completed: false
    //         },
    //         {
    //             description: 'pot plants',
    //             completed: false
    //         }
    // ], (error, result) => {
    //     if(error){
    //         return console.log('Unable to insert documents!')
    //     }
    //     console.log(result.ops)
    // })

    /**********************************/

    // R - Read *************************

    //searching using a field except ObjectID
    // db.collection('users').findOne({name: 'Omen'}, (error, user) => {
    //     if(error){
    //         return console.log('Unable to fetch')
    //     }

    //     console.log(user)
    // })

    //searching the collection using ObjectID
    //searching _id: "5fdc725c89239932bcab2df2" isn't valid and will return null because _id is stored in binary form so
    //convert it in binary form using new ObjectID("5fdc725c89239932bcab2df2")
    // db.collection('users').findOne({_id: new ObjectID("5fdc725c89239932bcab2df2")}, (error, user) => {
    //     if(error){
    //         return console.log('Unable to fetch')
    //     }

    //     console.log(user)
    // })

    //finding multiple users
    //doesn't not take any callback and returns a cursor(which is a pointer that points to the data in databse)
    // db.collection('users').find({age: 20}).toArray((error, users) => {
    //     console.log(users)
    // })

    // db.collection('users').find({age: 20}).count((error, users) => {
    //     console.log(users)
    // })

    /*******************************/


    //U - Update ********************

    // const updatePromise = db.collection('users').updateOne({
    //     _id: new ObjectID("5fdc735176314945c4e8a466")
    // },{
    //     //use update operators
    //     $set: {
    //         name: 'Not Pulkit'
    //     }
    // })

    // updatePromise.then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })  

    //updating many documents
    // db.collection('users').updateMany({
    //     age: 20
    // },{
    //     $inc: {
    //         age: 1
    //     }
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    /******************************/

    //D - Delete *******************
    //similar to the other 3 operations
    /***************************/

})