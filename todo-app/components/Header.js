import React from 'react'
import { FaUser } from 'react-icons/fa';


export default function Header() {
  return (
    <div className='sticky top-0 w-full left-0 bg-inherit flex items-center justify-between p-4 border-b border-solid border-white'>
    <h1 className='text-3xl select-none sm:text-6xl'>TODO LIST</h1>
        <FaUser className='text-xl sm:text-3xl duration-300 hover:opacity-40 cursor-pointer'/>
    </div>
  )
}
  