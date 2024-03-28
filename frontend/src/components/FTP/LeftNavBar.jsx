import { Files, Settings, Share2, FileUp, FileHeart, PackageOpen, Package } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function LeftNavBar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className='left-navbar flex flex-col items-center gap-10 pt-10'>
      <Link to='/ftp' className='flex gap-1 text-xl hover:opacity-70' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {isHovered ? <PackageOpen /> : <Package />}
        File Storage
      </Link>
      <div className='tiles w-full h-full relative'>
        <Link to='/ftp/files' className='tile'><Files /> My Files</Link>
        <Link to='/ftp/files/shared' className='tile'><Share2 /> Shared Files</Link>
        <Link to='/ftp/files/favorites' className='tile'><FileHeart /> Favorites</Link>
        <Link to='/ftp/files/upload' className='tile'><FileUp /> Upload Files</Link>
        <Link to='/ftp/files/settings' className='tile absolute bottom-0 w-full'><Settings />Settings</Link>
      </div>
    </div>
  )
}

export default LeftNavBar