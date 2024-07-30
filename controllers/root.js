const rootRouter = require('express').Router();


rootRouter.get('/',(request,response)=>{
    response.send("User Management and Bill Splitting App")
})

module.exports=rootRouter