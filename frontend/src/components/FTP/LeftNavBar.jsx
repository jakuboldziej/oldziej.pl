import React from 'react'
import { Link } from 'react-router-dom'

function LeftNavBar() {
  return (
    <div className='left-navbar flex flex-col items-center gap-10 pt-10'>
      <Link to='/ftp' className='text-xl hover:opacity-70'>File Storage</Link>
      <div className='tiles w-full h-full relative'>
        <Link to='/ftp/files' className='tile'>My Files</Link>
        <Link to='/ftp/files/shared' className='tile'>Shared Files</Link>
        <Link to='/ftp/files/favorites' className='tile'>Favorites</Link>
        <Link to='/ftp/files/upload' className='tile'>Upload Files</Link>
        <Link to='/ftp/files/settings' className='tile absolute bottom-0 w-full'>Settings</Link>
      </div>
    </div>
  )
}

export default LeftNavBar