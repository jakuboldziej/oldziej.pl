import { Files, Settings, Share2, FileUp, FileHeart, PackageOpen, Package, Database } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function LeftNavBar() {
  const [isHovered, setIsHovered] = useState(false);

  const location = useLocation();
  const locationPathname = location.pathname;

  return (
    <div className='left-navbar flex flex-col items-center gap-10 pt-10'>
      <Link to='/ftp' className='flex gap-1 text-xl hover:opacity-70' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {locationPathname === '/ftp' ? <PackageOpen /> : (
          isHovered ?
            <PackageOpen /> : 
            <Package />
        )}
        File Storage
      </Link>
      <div className='tiles w-full h-full relative'>
        <Link to='/ftp/files' className={`tile ${locationPathname === '/ftp/files' ? 'active' : ''}`}><Files /> My Files</Link>
        <Link to='/ftp/files/shared' className={`tile ${locationPathname === '/ftp/files/shared' ? 'active' : ''}`}><Share2 /> Shared Files</Link>
        <Link to='/ftp/files/favorites' className={`tile ${locationPathname === '/ftp/files/favorites' ? 'active' : ''}`}><FileHeart /> Favorites</Link>
        <Link to='/ftp/files/upload' className={`tile ${locationPathname === '/ftp/files/upload' ? 'active' : ''}`}><FileUp /> Upload Files</Link>
        <div className=' absolute bottom-0 w-full'>
          <Link to='/ftp/storage' className={`tile ${locationPathname === '/ftp/storage' ? 'active' : ''}`}><Database />Storage</Link>
          <Link to='/ftp/settings' className={`tile ${locationPathname === '/ftp/settings' ? 'active' : ''}`}><Settings />Settings</Link>
        </div>
      </div>
    </div>
  )
}

export default LeftNavBar