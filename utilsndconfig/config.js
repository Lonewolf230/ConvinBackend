
require('dotenv').config()

let uri
if(process.env.NODE_ENV==='production')
    uri=process.env.MONGO_DB_URI_PROD
else if(process.env.NODE_ENV==='test')
    uri=process.env.MONGODB_URI_TEST
else if(process.env.NODE_ENV==='development')
    uri=process.env.MONGODB_URI_DEV

const port=process.env.PORT || 5000


module.exports={uri,port}