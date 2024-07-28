const express=require('express')
const cookieParser=require('cookie-parser')
const ws=require('ws')
const fs=require('fs')
const jwt=require('jsonwebtoken')
const Message=require('./Models/Message')

require('dotenv').config()

const app=express()
app.use('/uploads', express.static(__dirname + '/uploads'))
const PORT=4000

app.use(express.json())
app.use(cookieParser())
const cors=require('cors')

app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL
}))

app.get('/test',(req,res)=>{
    res.send(`<h1>testing</h1>`)
})

const dbConnect=require('./Config/database');
dbConnect();

const router=require('./Routes/UesrRoutes')
app.use('/api/v1',router)

const server=app.listen(PORT)

const wss=new ws.WebSocketServer({server})
wss.on('connection',(connection, req)=>{

    function notifyOnlinePeople() {
        [...wss.clients].forEach((client)=>{
            client.send(JSON.stringify(
                {online: [...wss.clients].map((c)=>({userId:c.userId,username:c.username}))}
            ))
        })
    }

    connection.isAlive=true;

    connection.timer = setInterval(()=>{
        connection.ping();

        connection.deathTimer=setTimeout(()=>{
            connection.isAlive=false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyOnlinePeople();
            console.log('dead');
        },1000);
    },5000)

    connection.on('pong',()=>{
        clearTimeout(connection.deathTimer);
    })
    console.log(req.headers);
    const cookies=req.headers.cookie
    console.log("Cookies",cookies)
    if (cookies){
       const cookieTokenString= cookies;
       console.log("Cookie to Token ",cookieTokenString)
       if (cookieTokenString){
        const token=cookieTokenString.split('=')[1]
        console.log("Token =",token)
        if (token)
           jwt.verify(token,process.env.JWT_SECRET,(err,userdata)=>{
            if (err) throw err;
            console.log("Printing User Data",userdata);
            const {userId,username}=userdata
            connection.userId=userId
            connection.username=username
        }) 
       }
    }

    connection.on('message', async (message)=>{
        const messageData=JSON.parse(message.toString()).message
        console.log("Message Data",messageData);
        const {recipient,text,file}=messageData;

        let filename=null;
        if (file) {
            const parts=file.name.split('.');
            const ext=parts[parts.length - 1];
            filename = Date.now()+'.'+ext;
            const path=__dirname+'/uploads/'+filename;

            const bufferData=new Buffer(file.data.split(',')[1], 'base64');

            fs.writeFile(path,bufferData, ()=>{
                console.log("File Saved: ",path);
            });

        }
        console.log(recipient)
        if (recipient && (text || file)){
            const newMes=await Message.create({
                sender:connection.userId,
                recipient,
                text,
                file:file? filename:null
            });
            [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({text, 
                sender:connection.userId,
                recipient,
                file: file ? filename : null,
                _id:newMes._id})));
        }
    })

    // console.log([...wss.clients]);
    console.log([...wss.clients].map((c)=>(
        c.username
    )));

    notifyOnlinePeople();
})

wss.on('close', (data)=>{
    console.log('disconnected', data);
})