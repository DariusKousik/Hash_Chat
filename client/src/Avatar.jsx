import React from 'react'

function Avatar({userId,username,online}) {
  const colors=['bg-red-200','bg-purple-200','bg-green-200','bg-blue-200'
    ,'bg-yellow-200','bg-teal-200'
  ]
  console.log("Username = ",username)
  const userIdBase10=parseInt(userId,16);
  const colind=userIdBase10 % colors.length
  return (
    <div className={`w-8 h-8 ${colors[colind]} rounded-full relative flex items-center justify-center`}>
    <span className='text-xl font-semibold'>{username[0]}</span>
    {
      online && (
        <div className='absolute w-3 h-3 bg-green-600 rounded-full -right-1 bottom-0 border border-white'></div>
      )
    }
    </div>
  )
}

export default Avatar
