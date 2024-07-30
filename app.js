const express=require('express');
const app=express()
const mongoose=require('mongoose');
const cors=require('cors')
const bodyParser=require('body-parser')
const config=require('./utilsndconfig/config')
const rootRouter=require('./controllers/root')
const usersRouter=require('./controllers/users')
const loginrouter=require('./controllers/login')
const expenseRouter=require('./controllers/expenses')
const middleware=require('./utilsndconfig/middleware')


mongoose.set('strictQuery',false)

mongoose.connect(config.uri).then(res=>{
    console.log("Connected to MongoDB")
})
.catch((error)=>console.log('Error connecting to MongoDB:',error.message))



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use('/',rootRouter)
app.use('/api/users',usersRouter)
app.use('/api/login',loginrouter)
app.use('/api/expenses',middleware.decodeTokenandVerify,expenseRouter)
app.use(middleware.errorHandler)
module.exports=app