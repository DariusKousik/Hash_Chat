const jwt = require('jsonwebtoken')
require('dotenv').config()
const getUserData = async(req)=>{
    return new Promise((resolve,reject)=>{
        const token = req.cookies?.token;
        if (token) {
        jwt.verify(token,process.env.JWT_SECRET,(err,userData)=>{
            if (err) throw err;
            resolve(userData)
        })
    } else {
        reject('No Token')
    }
    })
}

module.exports=getUserData;