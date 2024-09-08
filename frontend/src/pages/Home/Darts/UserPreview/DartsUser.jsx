import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDartsGames, getDartsUser } from '@/lib/fetch';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { UserBarChart } from './UserBarChart';
import Loading from '@/components/Home/Loading';

function DartsUser() {
  const { username } = useParams();
  document.title = `Oldziej | ${username}`
  const [dartUser, setDartUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const resUser = await getDartsUser(username);
      const resGames = await getDartsGames(username);
      resUser.games = resGames.reverse();
      setDartUser(resUser);
      setIsLoading(false);
    }

    fetchUserData();
  }, []);

  return (
    <div className='dart-user'>
      <div className='header'>
        <b className='text-2xl'>{username}</b>
      </div>
      {isLoading ? (
        <Loading />
      ) :
        <>
          <div className='overall-stats flex flex-row gap-10 text-center text-lg'>
            <span className="elementInfo ">
              <img width="35" height="35" src="https://img.icons8.com/color/35/first-place-ribbon.png" alt="first-place-ribbon" />
              {dartUser.podiums["firstPlace"]}
            </span>
            <span className="elementInfo">
              <img width="35" height="35" src="https://img.icons8.com/color/35/second-place-ribbon.png" alt="first-place-ribbon" />
              {dartUser.podiums["secondPlace"]}
            </span>
            <span className="elementInfo">
              <img width="35" height="35" src="https://img.icons8.com/color/35/third-place-ribbon.png" alt="first-place-ribbon" />
              {dartUser.podiums["thirdPlace"]}
            </span>
            <MyTooltip title="Doors Hit">
              <span className="elementInfo">
                <img width="35" height="35" src="https://img.icons8.com/officel/35/door.png" alt="door" />
                {dartUser.throws["doors"]}
              </span>
            </MyTooltip>
            <MyTooltip title="Games Played">
              <span className="elementInfo">
                <img width="35" height="35" src="https://img.icons8.com/color/35/goal--v1.png" alt="goal--v1" />
                {dartUser.gamesPlayed}
              </span>
            </MyTooltip>
            <MyTooltip title="Highest Ending Average">
              <span className="elementInfo">
                <img width="35" height="35" src="https://img.icons8.com/arcade/35/graph.png" alt="graph" />
                <h6>{dartUser.highestEndingAvg}</h6>
              </span>
            </MyTooltip>
            <MyTooltip title="Highest Turn Points">
              <span className="elementInfo">
                <img width="35" height="35" src="https://img.icons8.com/color/35/mountain.png" alt="mountain" />
                <h6>{dartUser.highestTurnPoints}</h6>
              </span>
            </MyTooltip>
            <MyTooltip title="Highest Checkout">
              <span className="elementInfo">
                <img width="35" height="35" src="https://img.icons8.com/color/35/cash-register.png" alt="cash-register" />
                <h6>{dartUser.highestCheckout}</h6>
              </span>
            </MyTooltip>
          </div>
          <div className='charts w-[99%] pb-10'>
            <UserBarChart dartUser={dartUser} />
          </div>
        </>}
    </div>
  )
}

export default DartsUser