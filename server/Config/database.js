const mongoose=require('mongoose')

require('dotenv').config()

const dbConnect=()=>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{console.log("Database Connected Successfully")})
    .catch((err)=>{
        console.log(err.message)
        console.error(err)
    })
}

module.exports=dbConnect