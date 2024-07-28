import Avatar from "./Avatar"

export default function Contacts({id,username,selected,onClick,online}) {
  console.log("UserName Avatar", username)
    return (
        <div onClick={()=> {
            onClick(id)
            // console.log(selectedUser)
          }} className={`border-b transition-all duration-200 border-gray-500 flex items-center gap-2 cursor-pointer  ${selected ? 'bg-teal-400':''}`}
          key={id} >
          {
            selected && (
              <div className='bg-blue-600 w-1 h-12'></div>
            )
          }
          <div className='p-2 flex gap-2 items-center'>
          <Avatar online={online} username={username} userId={id} ></Avatar>
          <span className='text-blue-700 font-semibold'>{username}</span>
          </div>
          </div>
    )
}