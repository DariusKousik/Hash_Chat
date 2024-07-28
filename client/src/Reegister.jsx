import axios from 'axios'
import React, { useContext, useState } from 'react'
import { UserContext } from './UserContext'

function Reegister() {
  const [formdata,setFormdata]=useState({
    username:"",
    password:""
  })
  const [isLogin,setIsLogin]=useState(true)
  const {setUsername:setLoggedinUsername,setId}=useContext(UserContext);
  const {username,password}=formdata
  const handleChange=(e)=>{
    setFormdata((pre)=>({
      ...pre,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit=async (e)=>{
    e.preventDefault();
    console.log('Form Submitted')
    console.log(username)
    console.log(password)
    const url=isLogin ? "/login": "/createuser"
    const {data}=await axios.post(url,{username,password})
    setLoggedinUsername(username)
    setId(data.id)
  }
  return (
    <div className='h-screen bg-blue-50 flex items-center'>
      <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit} >
        <input type="text"
         id='username'
         name='username'
         placeholder='username'
         onChange={handleChange}
         className='w-full block rounded-md p-2 mb-2' />
        <input type="password"
         id='password'
         name='password'
         placeholder='password'
        onChange={handleChange}
         className='w-full block rounded-md p-2 mb-2' />
        <button className='bg-blue-500 text-white w-full rounded-md p-2' type='submit'>{
          isLogin ? "Login":"Register"
        }</button>
        {
          !isLogin ? (<div className='text-center mt-2'>
          Already a member <button onClick={()=>{setIsLogin(true)}}>Login here</button>
        </div>):(
          <div className='text-center mt-2'>
          New here <button onClick={()=>{setIsLogin(false)}}>Register first</button>
        </div>
        )
        }
      </form>
    </div>
  )
}

export default Reegister
