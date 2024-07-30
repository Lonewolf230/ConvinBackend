const usersRouter = require('express').Router();
require('dotenv').config()
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const User=require('../models/user')



usersRouter.post('/',async(request,response)=>{

    const body=request.body

    if(body.password.length<6){
        return response.status(400).json({error:'Password must be at least 3 characters long'})
    }

    const hashedPassword= await bcrypt.hash(body.password,10)


    const user=new User({
        email:body.email,
        name:body.name,
        hashedPassword:hashedPassword,
        username:body.username,
        phone:body.phone
    })

    try{
        const allUsers=await User.find({})
        const usernames=allUsers.map(user=>user.username)
        const userExists=usernames.find(username=>username===body.username)
        if(userExists)
            return response.status(400).json({error:"Username already exists"})
        const savedUser=await user.save()
        response.status(201).json(savedUser)
    }
    catch(error){
        return response.status(400).json({error:error.message})
    }
})

usersRouter.get('/',async(request,response)=>{
    const allUsers=await User.find({})
    response.status(200).json(allUsers)
})

usersRouter.get('/:username',async(request,response)=>{
    const username=request.params.username
    try{
        const user=await User.findOne({username})
        if(!user)
            return response.status(404).json({error:"User not found"})
        response.status(200).json(user)
    }
    catch(error){
        return response.status(400).json({error:error.message})
    }

})

module.exports=usersRouter



