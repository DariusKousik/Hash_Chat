import axios from "axios";
import { useEffect, useState } from "react";
import { createContext } from "react";

export const UserContext=createContext({})

export function UserContextProvider ({children}) {
    const[username,setUsername]=useState(null)
    const[id,setId]=useState(null)

    useEffect(()=>{
        axios.get('/profile')
        .then((res)=>{
            console.log('Response = ',res);
            setId(res.data.userId);
            setUsername(res.data.username);
        })
        .catch((err)=>{
            console.log("Error ",err)
        })
    },[])
    return (
        <UserContext.Provider value={{username,setUsername,id,setId}} >
            {children}
        </UserContext.Provider>
    )
}