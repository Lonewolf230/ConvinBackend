
const mongoose = require('mongoose');

const expenseSchema=new mongoose.Schema({
    expense:{
        type:Number
    },
    paid:{
        type:Boolean,
        default:false
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

expenseSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=document._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports=mongoose.model('Expense',expenseSchema)
