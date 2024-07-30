const expenseRouter=require('express').Router()
const User=require('../models/user')
const Expense=require('../models/expense')
const excelJS=require('exceljs')




expenseRouter.post('/add/equal',async(request,response)=>{
    const {total,users}=request.body
    const decodedToken=request.decodedToken
    if(!decodedToken.id)
        return response.status(401).json({error:"Please Log in to continue"})
    
    const no_of_users=users.length
    if(!(total>0 && no_of_users>0))
        return response.status(400).json({error:"Invalid input (check the total or the number of users"})
    

    const expense=total/no_of_users

    try{

        const userDetails = await User.find({ username: { $in: users } });
        if (userDetails.length !== no_of_users) {
            return response.status(404).json({ error: "One or more users not found" });
        }

        for(let username of users ){
            const userDet=await User.findOne({username})
            userDet.amountPending=(userDet.amountPending||0)+expense

            const newExpense=new Expense({
                expense,
                user:userDet._id,
            })

            await userDet.save()
            await newExpense.save()
        }
        response.status(201).json({message:"Expense added successfully"})
    }
    catch(error){
        return response.status(500).json({error:error.message})
    }
})

expenseRouter.post('/add/exact',async(request,response)=>{
    const {total,users}=request.body

    const decodedToken=request.decodedToken
    if(!decodedToken.id)
        return response.status(401).json({error:"Please Log in to continue"})

    const no_of_users=users.length
    if(!(total>0 && no_of_users>0))
        return response.status(400).json({error:"Invalid input (check the total or the number of users"})

    try{
        const usernames=users.map(user=>user.username)
        const userDetails=await User.find({username:{$in:usernames}})
        if(userDetails.length!==no_of_users)
            return response.status(404).json({error:"One or more users not found"})
        
        for(let user of users){
            const {username,expense}=user
            const userDet=await User.findOne({username})
            if(!userDet)
                return response.status(404).json({error:"User not found"})
            userDet.amountPending=(userDet.amountPending||0)+expense
            
            const newExpense=new Expense({
                expense,
                user:userDet._id
            })

            await userDet.save()
            await newExpense.save()
        }
        response.status(201).json({message:"Expense added successfully"})
    }
    catch(error){
        return response.status(500).json({error:error.message})
    }

})

expenseRouter.post('/add/percent',async(request,response)=>{

    const {total,users}=request.body

    const decodedToken=request.decodedToken
    if(!decodedToken.id)
        return response.status(401).json({error:"Please Log in to continue"})

    let percentTotal=0
    users.forEach(user=>{
        percentTotal+=user.percent
    })
    if(!(total>0 && percentTotal===100))
        return response.status(400).json({error:"Invalid input (check the total or the percentage)"})

    try{

        const usernames=users.map(user=>user.username)
        const userDetails=await User.find({username:{$in:usernames}})
        if(userDetails.length!==users.length)
            return response.status(404).json({error:"One or more users not found"})

        for(let user of users){
            const {username,percent}=user
            const userDet=await User.findOne({username})

            const expense=(total*percent)/100

            const newExpense=new Expense({
                expense,
                user:userDet._id
            })

            userDet.amountPending=(userDet.amountPending||0)+expense
            await userDet.save()    
            await newExpense.save()
        }
        response.status(201).json({message:"Expense added successfully"})
    }
    catch(error){
        return response.status(500).json({error:error.message})
    }
})

expenseRouter.get('/',async(request,response)=>{

    const decodedToken=request.decodedToken
    if(!decodedToken.id)
        return response.status(401).json({error:"Please Log in to continue"})
    const allExpenses=await Expense.find({}).populate('user',{username:1})
    response.status(200).json(allExpenses)
})

expenseRouter.get('/download',async(request,response)=>{

    const decodedToken=request.decodedToken
    console.log(decodedToken)
    console.log("accessing general download route")
    if(!decodedToken.id)
        return response.status(401).json({error:"Please Log In"})
    

    try{
        const expenses=await Expense.find({}).populate('user',{username:1})

        const workbook=new excelJS.Workbook()
        const worksheet=workbook.addWorksheet('Expenses of all Users')
        worksheet.columns=[
            {header:'S.No',key:'sno',width:10},
            {header:'Username',key:'username',width:20},
            {header:'Expense',key:'expense',width:20},
            {header:'Generated On',key:'createdAt',width:20},
            {header:'Paid',key:'paid',width:10},
            {header:'Paid On',key:'paidOn',width:20}    
        ]
        let sno=1
        expenses.forEach(expense=>{
            worksheet.addRow({
                sno:sno++,
                username:expense.user.username,
                expense:expense.expense,
                createdAt:expense.createdAt,
                paid:expense.paid?'Yes':'No',
                paidOn:expense.paid?expense.updatedAt:'NA'
            })
        })
        response.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response.setHeader('Content-Disposition','attachement; filename='+`overall_expenses.xlsx`)

        await workbook.xlsx.write(response)
        response.end()
    }
    catch(error){
        return response.status(500).json({error:"Cannot generate excel sheet"})
    }
})

expenseRouter.get('/:username',async(request,response)=>{

    const username=request.params.username
    const decodedToken=request.decodedToken

    try{
        const user=await User.findOne({username})
        if(!user)   
            return response.status(404).json({error:"User not found"})
        if(user._id.toString()!==decodedToken.id)
            return response.status(403).json({error:"Unauthorized access"})

        const expenses = await Expense.find({user:user._id}).populate('user',{username:1})

        response.status(200).json(expenses)
    }
    catch(error){
        return response.status(500).json({error:error.message})
    }
})

expenseRouter.post('/pay/:username/:id',async(request,response)=>{
    const username=request.params.username
    const id=request.params.id

    try{
        const user=await User.findOne({username})
        const expense=await Expense.findById(id)
        if(!user || !expense)
            return response.status(404).json({error:"User or Expense not found"})

        if(expense.paid)
            return response.status(400).json({error:"Expense already paid"})
        
        user.amountPending-=expense.expense
        expense.paid=true

        await user.save()
        await expense.save()

        response.status(200).json({message:"Payment successful"})
    }
    catch(error){
        return response.status(500).json({error:error.message})
    }
})

expenseRouter.get('/download/:username',async(request,response)=>{

    const username=request.params.username
    const decodedToken=request.decodedToken
    console.log("accessing username download route");
    try{
        const user=await User.findOne({username})
        if(!user)
            return response.status(404).json({error:"User not found"})
        if(user._id.toString()!==decodedToken.id)
            return response.status(403).json({error:"Unauthorized access"})

        const workbook=new excelJS.Workbook()
        const worksheet=workbook.addWorksheet('Expenses')

        const expenses=await Expense.find({user:user._id})
        worksheet.columns=[
            {header:'S.No',key:'sno',width:10},
            {header:'Expense',key:'expense',width:20},
            {header:'Generated On',key:'createdAt',width:20},
            {header:'Paid',key:'paid',width:10},
            {header:'Paid On',key:'paidOn',width:20}
        ]
        let sno=1
        expenses.forEach(expense=>{
            worksheet.addRow({
                sno:sno++,
                expense:expense.expense,
                createdAt:expense.createdAt,
                paid:expense.paid?'Yes':'No',
                paidOn:expense.paid?expense.updatedAt:'NA'
            })
        })

        response.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response.setHeader('Content-Disposition','attachement; filename='+`${username}_expenses.xlsx`)

        await workbook.xlsx.write(response)
        response.end()
    }
    catch(error){
        return response.status(500).json({error:'Cannot generate excel sheet'})
    }
})




module.exports=expenseRouter