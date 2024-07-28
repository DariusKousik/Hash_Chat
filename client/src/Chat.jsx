import React, { useContext, useEffect, useRef, useState } from 'react'
import { IoSend } from "react-icons/io5";
import { FaRocketchat } from "react-icons/fa6";
import { UserContext } from './UserContext';
import _, { uniqBy } from 'lodash';
import axios from 'axios';
import Contacts from './Contacts';
import { FaUser } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";

function Chat() {
    const [ws,setWs]=useState(null)
    const [onlinePeople,setOnlinePeople]=useState({})
    const [offlinePeople,setOfflinePeople]=useState({})
    const [selectedUser,setSelectedUser]=useState(null)
    const [message,setMessage]=useState('')
    const [allMessages,setAllMessages]=useState([])
    const {username ,id, setUsername,setId}=useContext(UserContext)
    const divUnderMessages=useRef()
    useEffect(()=>{
        connectToWs();
    },[])

    function connectToWs() {
        const ws=new WebSocket('ws://localhost:4000');
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', ()=>{
          setTimeout(()=>{
            connectToWs();
          },1000)
        })
    }
    function showOnlinePeople (peopleArray){
      const people = {};
      // console.log("People Array = ",peopleArray)
      peopleArray.forEach(({userId,username})=>{
        people[userId]=username
      })

      console.log(people);
      setOnlinePeople(people)
    }

    function logout(){
      axios.post('/logout').then(()=>{
        setWs(null)
        setId(null)
        setUsername(null)
      })
    }

    function handleMessage(ev) {
      const messageData=JSON.parse(ev.data)
      console.log("message ",{messageData})
      if ('online' in messageData){
        showOnlinePeople(messageData.online)
      }
      else if ('text' in messageData) {
        setAllMessages((pre)=> ([...pre,{...messageData}]))
      }
        // ev.data.text().then(messageString =>{
        //   console.log(messageString)
        // })
    }

    function handleSubmit (ev, file=null) {

      if (ev) ev.preventDefault();

      ws.send(JSON.stringify({
        message:{
          recipient:selectedUser,
          text:message,
          file,
        }
      }))
      if (file){
        axios.get('/message/'+selectedUser).then(res =>{
          setAllMessages(res.data)
        })
      }
      else {
        setMessage('')
        setAllMessages((prev)=>([...prev,{text:message,
          sender:id,
          recipient:selectedUser,
          _id:Date.now()
        }]));
      }
    }
    function sendFile(ev) {
      const reader=new FileReader();
      reader.readAsDataURL(ev.target.files[0]);
      reader.onload = ()=>{
        handleSubmit(null, {
          name: ev.target.files[0].name,
          data: reader.result
        })
      }
    }

    useEffect(()=> {
      const div= divUnderMessages.current;
      if (div)
      div.scrollIntoView({behavior:'smooth', block:'end'})
    },[allMessages])

    useEffect(()=>{
      axios.get('/people').then((res)=>{
        const offlinePeopleArr=res.data
        .filter(p => p._id!==id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id))
        const offlinePeople={}
        offlinePeopleArr.forEach(p => {
          offlinePeople[p._id]=p
        })
        console.log({offlinePeople,offlinePeopleArr})
        setOfflinePeople(offlinePeople)
      })
    },[onlinePeople])
    
    useEffect(()=>{
      if (selectedUser){
        axios.get('/messages/'+selectedUser).then(res => {
          setAllMessages(res.data)
        })
      }
    },[selectedUser,allMessages])
    
    console.log("Online ",onlinePeople)
    const onlinewithoutuser={...onlinePeople}
    delete onlinewithoutuser[id]
    console.log("OnlineWithoutUser = ",onlinewithoutuser);

    const messageWithoutDupes=uniqBy(allMessages,'_id')
  return (
    <div className='flex h-screen bg-blue-100'>
      <div className='bg-blue-100 w-1/3'>
      <div className=' flex items-center mb-4 justify-center gap-2 text-blue-600 font-bold text-2xl'>
      <FaRocketchat />
      <p>HashChat</p> 
      </div>
        {Object.keys(onlinewithoutuser).map(userId => (
          <Contacts 
          key={userId}
          id={userId}
          online={true}
          username={onlinewithoutuser[userId]}
          onClick={()=> setSelectedUser(userId)}
            selected={userId === selectedUser ? (true):(false)}
          ></Contacts>
        ))}
        {
          Object.keys(offlinePeople).map(userId => (
          <Contacts 
          key={userId}
          id={userId}
          online={false}
          username={offlinePeople[userId].username}
          onClick={()=> setSelectedUser(userId)}
            selected={userId === selectedUser ? (true):(false)}
          ></Contacts>
        ))} 

        <div className='absolute bottom-3 left-[10%] flex items-center justify-between text-xl gap-2 text-gray-600 font-bold'>
        <div className='flex items-center justify-center'>
        <FaUser />
        <p>{username}</p>
        </div>
          <button
          onClick={logout} 
          className='text-md font-bold rounded-md border text-gray-600 bg-blue-300 py-2 px-3'>Logout</button>
        </div>
      </div>
      <div className='bg-blue-300 flex flex-col w-2/3 py-4 rounded-md'>
        <div className='flex-grow'>
          {
            !selectedUser && (
              <div className='h-full flex flex-col items-center justify-center translate-y-[900%]'><div className='text-gray-700 font-bold text-3xl'>No User Selected</div></div>
            )
          }
        </div>
        <div className='h-full font-bold overflow-y-scroll mb-2'>
          {
            !!selectedUser && (
              <div>
                {
                  messageWithoutDupes.map((mes)=> (
                    <div className={`${mes.sender === id ? "flex justify-start w-full":"flex justify-end w-full"}`}>
                    <div className={`${mes.sender === id ? "bg-blue-100 text-ellipsis max-w-fit h-fit text-gray-500 mt-2 mr-[60%] text-start rounded-md px-4 py-2 text-xl":"bg-blue-400 text-ellipsis h-fit max-w-fit text-white rounded-md mt-2 ml-[60%] text-start px-4 py-2 text-xl"}`}>
                    {mes.text}
                    {mes.file && (
                      <div className='underline'>
                        <a target='_blank' href={'http://localhost:4000/uploads/' + mes.file}>{mes.file}</a>
                      </div>
                    )}
                    </div>
                    </div>
                    
                  ))
                }
              </div>
            )
          }
          <div ref={divUnderMessages}></div>
        </div>
        {!! selectedUser && (
          <form className='flex gap-2 mx-2' onSubmit={handleSubmit} >
            <input type="text" placeholder='Type your Message here' className='bg-white border p-2 flex-grow rounded-md '
            value={message} onChange={(ev)=> {setMessage(ev.target.value)}} />
            <label className='text-xl text-gray-700 p-2 bg-gray-100 opacity-55 rounded-md flex items-center justify-center cursor-pointer'>
            <input type="file" className='hidden' onChange={sendFile} />
            <GrAttachment />
            </label>
            <button className='bg-blue-500 text-white p-2 flex items-center justify-center text-lg rounded-md w-14' type='submit'><IoSend /></button>
        </form>
        )}
      </div>
    </div>
  )
}

export default Chat
