

require('dotenv').config()
const jwt=require('jsonwebtoken')

const errorHandler=(error,request,response,next)=>{
    if(error.name==='CastError')
        return response.status(400).send({error:"Malformed Error"})
    else if(error.name==='ValidationError')
        return response.status(400).send({error:error.message})
    else if(error.name==='JsonWebTokenError')
        return response.status(401).send({error:"Invalid Token"})
    else if(error.name==='TokenExpiredError')
        return response.status(401).send({error:"Token Expired"})
    next(error)
}


const getTokenFromHeader= (request)=>{
    const authorization=request.get('authorization')
    if(authorization && authorization.startsWith('Bearer ')){
        return authorization.replace('Bearer ','')
    }
    return null
}

const decodeTokenandVerify=async(request,response,next)=>{
    try{
        const token=getTokenFromHeader(request)
        const decodedToken=jwt.verify(token,process.env.SECRET)
        if(!token || !decodedToken.id)
            return response.status(401).json({error:"Token missing or invalid"})
        request.decodedToken=decodedToken
        next()
    }
    catch(error){
        if(error.name==="TokenExpiredError")
            return response.status(401).json({error:"Token Expired"})
        next(error)
    }
    
}

module.exports={errorHandler,decodeTokenandVerify,errorHandler}