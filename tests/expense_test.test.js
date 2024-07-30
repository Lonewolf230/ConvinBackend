const supertest=require('supertest')
const Expense=require('../models/expense')
const User=require('../models/user')
const app=require('../app')
const { default: mongoose } = require('mongoose')
const api=supertest(app)
let token;

beforeAll(async()=>{  
    await User.deleteMany({})  
    const user1={
        username:"FirstUser",
            password:"UserZero",
            name:"Zerouser",
            email:"zeroUser@gmail.com",
            phone:"0987654321",
    }
    
    const user2={
        username:"SecondUser",
            password:"UserOne",
            name:"Oneuser",
            email:"oneUser@gmail.com",
            phone:"0987094321",
    }
    
    

    await api.post('/api/users').send(user1).expect(201).expect('Content-type',/application\/json/)
    await api.post('/api/users').send(user2).expect(201).expect('Content-type',/application\/json/)


    const response=await api.post('/api/login').send({username:"FirstUser",password:"UserZero"}).expect(200)

    token=response.body.token
    console.log(response.body.token)
    
})

afterAll(async()=>{
    await Expense.deleteMany({})
    await mongoose.connection.close()
})


describe('Testing all add methods',()=>{

    test('testing equal',async ()=>{
        const newExpense={
            total:2000,
            users:["FirstUser","SecondUser"]
        }

        const response=await api.post('/api/expenses/add/equal').set('Authorization',`Bearer ${token}`).send(newExpense).expect(201).expect('Content-type',/application\/json/)
        expect(response.body.message).toEqual('Expense added successfully')
    })

    test('testing exact',async ()=>{
        const newExpense={
            total:2000,
            users:[{username:"FirstUser",expense:1500},{username:"SecondUser",expense:500}]
        }

        const response=await api.post('/api/expenses/add/exact').set('Authorization',`Bearer ${token}`).send(newExpense).expect(201).expect('Content-type',/application\/json/)
        expect(response.body.message).toEqual('Expense added successfully')
    })

    test('testing percent',async()=>{
        const newExpense={
            total:2000,
            users:[{username:"FirstUser",percent:75},{username:"SecondUser",percent:25}]
        }

        const response=await api.post('/api/expenses/add/percent').set('Authorization',`Bearer ${token}`).send(newExpense).expect(201).expect('Content-type',/application\/json/)
        expect(response.body.message).toEqual('Expense added successfully')
    })
  
})

