const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        unique:true,
        required:true,
        minLength:6
    },
    phone:{
        type:String,
        minLength:10,
        maxLength:10,
        required:true   
    },  
    hashedPassword:{
        type:String
    },
    amountPending:{
        type:Number
    }
})


userSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=document._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.hashedPassword
    }
})

module.exports=mongoose.model('User',userSchema)