import { useParams } from 'react-router';
import NavBar from '@/components/Home/NavBar';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function DartsUser() {
  const { username } = useParams();
  document.title = `Oldziej | ${username}`
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false)
  }, []);

  return (
    <>
      <NavBar />
      <div className='dart-user'>
        <div className='header'>
          <b className='text-2xl'>{user?.displayName}</b>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-5 gap-2">
            <Loader2 className="h-10 w-10 animate-spin" />
            <div>Loading Statistics...</div>
          </div>
        ) :
          <>
            <div className='overall-stats'>
              <span>{username}</span>
            </div>
            <div className='charts'>
            </div>
          </>}
      </div>
    </>
  )
}

export default DartsUser