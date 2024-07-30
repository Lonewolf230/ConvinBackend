
const app=require('./app')
const config=require('./utilsndconfig/config')

app.listen(config.port,(request,response)=>{
    console.log(`Server running on port ${config.port}`);
})
