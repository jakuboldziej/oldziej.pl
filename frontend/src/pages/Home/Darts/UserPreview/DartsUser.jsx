import { useParams } from 'react-router';
import NavBar from '@/components/Home/NavBar';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDartsGames, getDartsUser, putDartsGame } from '@/fetch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { UserBarChart } from './UserBarChart';

function DartsUser() {
  const { username } = useParams();
  document.title = `Oldziej | ${username}`
  const [dartUser, setDartUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const resUser = await getDartsUser(username);
      const resGames = await getDartsGames(username);
      resUser.games = resGames;
      setDartUser(resUser);
      setIsLoading(false);
    }

    fetchUserData();
  }, []);

  return (
    <>
      <NavBar />
      <div className='dart-user'>
        <div className='header'>
          <b className='text-2xl'>{username}</b>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-5 gap-2">
            <Loader2 className="h-10 w-10 animate-spin" />
            <div>Loading Statistics...</div>
          </div>
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
            <div className='charts w-[1000px] pb-10'>
              <UserBarChart dartUser={dartUser} />
            </div>
          </>}
      </div>
    </>
  )
}

// const findCurrentUserInGame = (users) => {
//   return users.find((user) => user.displayName === username);
// }

// {dartUser.games.map((game) => (
//   <Table className='border-2 border-white' key={game._id}>
//     <TableHeader>
//       <TableRow>
//         <TableHead className='flex gap-4 justify-center'>
//           <img width="48" height="48" src="https://img.icons8.com/color/48/first-place-ribbon.png" alt="first-place-ribbon" />
//           <img width="48" height="48" src="https://img.icons8.com/color/48/second-place-ribbon.png" alt="first-place-ribbon" />
//           <img width="48" height="48" src="https://img.icons8.com/color/48/third-place-ribbon.png" alt="first-place-ribbon" />
//         </TableHead>
//         <TableHead>Start Points</TableHead>
//         <TableHead>AllGainedPoints</TableHead>
//         <TableHead>highestGameTurnPoints</TableHead>
//         <TableHead>gameCheckout</TableHead>
//         <TableHead>avgPointsPerTurn</TableHead>
//       </TableRow>
//     </TableHeader>
//     <TableBody>
//       <TableRow>
//         <TableCell className='flex gap-4 justify-center'>
//           <span>{game.podium[1] || "None"}</span>
//           <span>{game.podium[2] || "None"}</span>
//           <span>{game.podium[3] || "None"}</span>
//         </TableCell>
//         <TableCell>{game.startPoints}</TableCell>
//         <TableCell>{findCurrentUserInGame(game.users).allGainedPoints}</TableCell>
//         <TableCell>{findCurrentUserInGame(game.users).highestGameTurnPoints}</TableCell>
//         <TableCell>{findCurrentUserInGame(game.users).gameCheckout}</TableCell>
//         <TableCell>{findCurrentUserInGame(game.users).avgPointsPerTurn}</TableCell>
//       </TableRow>
//     </TableBody>
//   </Table>
// ))}

export default DartsUser