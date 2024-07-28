import { useContext } from "react";
import Reegister from "./Reegister";
import { UserContext } from "./UserContext";
import Chat from "./Chat";

export default function Routes () {
    const {username}=useContext(UserContext)
    if (username){
        return <Chat></Chat>
    }
    return (
        <Reegister></Reegister>
    )
}