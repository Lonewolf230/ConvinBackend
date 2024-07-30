const loginrouter= require('express').Router();
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const User=require('../models/user')
const config=require('../utilsndconfig/config')
require('dotenv').config()



loginrouter.post('/',async(request,response)=>{
    const {username,password}=request.body
    const user=await User.findOne({username})
    const isPasswordCorrect = user===null?false:await bcrypt.compare(password,user.hashedPassword)
    
    if(!(user && isPasswordCorrect)){
        return response.status(401).json({error:"Invalid username or password"})
    }

    const userTokenGen={
        username:user.username,
        id:user._id
    } 

    const token=jwt.sign(userTokenGen,process.env.SECRET,{expiresIn:60*60})
    response.status(200).send({token,username:user.username,name:user.name})
})


module.exports=loginrouter