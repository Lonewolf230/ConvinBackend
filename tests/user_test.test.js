const supertest=require('supertest')
const mongoose=require('mongoose')
const app=require('../app')
const User=require('../models/user')
const expense = require('../models/expense')
const api=supertest(app)


beforeAll(async()=>{
    await User.deleteMany({})
    const newUser=new User({
        username:"FirstUser",
            password:"UserZero",
            name:"Zerouser",
            email:"zeroUser@gmail.com",
            phone:"0987654321",
    })
    const newUser2=new User({
        username:"SecondUser",
            password:"UserOne",
            name:"Oneuser",
            email:"oneUser@gmail.com",
            phone:"0987094321",
    })
    await newUser.save()
    await newUser2.save()
})

describe('Create User',()=>{

    beforeAll(async()=>{
        await User.deleteMany({})  
    })

    test('create a new user', async()=>{
        const newUser={
            username:"TestUser",
            password:"User00",
            name:"Testuser",
            email:"testUser@gmail.com",
            phone:"1234567890",
        }
        
        await api.post('/api/users').send(newUser).expect(201).expect('Content-type',/application\/json/)
    })
})

describe('Testing get requests',()=>{

    test('Get all users',async()=>{
        const response=await api.get('/api/users').expect(200).expect('Content-type',/application\/json/)      
        console.log(response.body);
    })

    test('Get user by username',async()=>{
        
        const response=await api.get('/api/users/FirstUser').expect(200).expect('Content-type',/application\/json/)
        console.log(response.body);
        //expect(response.body[0].username).toEqual('FirstUser')
    })

})

afterEach(async ()=>{
    await User.deleteMany({})

})
afterAll(async ()=>{
    await mongoose.connection.close()
})