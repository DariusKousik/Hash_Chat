const User=require('../Models/Uesr')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const getUserData = require('../Config/GetUserData')
const Message=require('../Models/Message')

exports.createUser=async(req,res)=>{
    try {
        console.log("Creating")
        const {username,password}=req.body
        const bcryptSalt=bcrypt.genSaltSync(10)
        const hashPassword=bcrypt.hashSync(password,bcryptSalt)
        const user=await User.create({
            username:username,
            password:hashPassword
        })

        console.log(username)
        console.log(user)

        jwt.sign({userId:user._id,username},process.env.JWT_SECRET,(err,token)=>{
            if (err) throw err;
            res.cookie('token',token).status(200).json({
                success:true,
                message:"User Created Successfully",
                id:user._id
            })
        })
    } catch(err) {
        console.log('Error in creating User ',err)
        return res.status(500).json({
            success:false,
            message:"Something went wrong in Creating User"
        })
    }
}

exports.isLogin = async(req,res)=>{
    const token=req.cookies?.token

    if (token){
        jwt.verify(token,process.env.JWT_SECRET,(err,userdata)=>{
            if (err) throw err;
            
            res.json(userdata);
        })
    } else {
        res.status(401).json('No token')
    }
    
}

exports.login = async(req,res)=>{
    try {
        const {username, password}=req.body
        const foundUser=await User.findOne({username})

        if (foundUser){
            const passok=bcrypt.compareSync(password,foundUser.password)
            if (passok){
                jwt.sign({userId:foundUser._id,username},process.env.JWT_SECRET,(err,token)=>{
                    if (err) throw err;
                    res.cookie('token',token).json({
                        id:foundUser._id
                    })
                })
            }
        }
    } catch (err) {
        console.log("Error in Login ",err)
        return res.status(500).json({
            success:false,
            message:"Something went wrong in Login"
        })
    }
}

exports.messages = async (req,res)=>{
    const {userId} = req.params;
    const userData=await getUserData(req)
    const ourUserId=userData.userId
    console.log({userId,ourUserId});
    const msg=await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]}
    }).sort({createdAt:1});
    res.json(msg);
}

exports.getPeople = async(req,res) =>{
    const users=await User.find({},{_id:1,username:1})
    res.json(users)
}

exports.logout = (req,res) => {
    res.cookie('token','').json('Ok')
}