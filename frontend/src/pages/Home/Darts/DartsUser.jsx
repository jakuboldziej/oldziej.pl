import { useParams } from 'react-router';
import NavBar from '@/components/Home/NavBar';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDartsGames, getDartsUser } from '@/fetch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';

function DartsUser() {
  const { username } = useParams();
  document.title = `Oldziej | ${username}`
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const resUser = await getDartsUser(username);
      const resGames = await getDartsGames(username);
      resUser.games = resGames;
      setUser(resUser);
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
            <div className='overall-stats'>
            </div>
            <div className='charts flex flex-col gap-10'>
              {user.games.map((game) => (
                <Table className='border-2 border-white' key={game._id}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Id</TableHead>
                      <TableHead>Start Points</TableHead>
                      <TableHead>highestEndingAvg</TableHead>
                      <TableHead>highestTurnPoints</TableHead>
                      <TableHead>highestGameCheckout</TableHead>
                      <TableHead>avgPointsPerTurn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{game._id}</TableCell>
                      <TableCell>{game.startPoints}</TableCell>
                      <TableCell>{game.users[0].highestEndingAvg}</TableCell>
                      <TableCell>{game.users[0].highestTurnPoints}</TableCell>
                      <TableCell>{game.users[0].highestGameCheckout}</TableCell>
                      <TableCell>{game.users[0].avgPointsPerTurn}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ))}

            </div>
          </>}
      </div>
    </>
  )
}

export default DartsUser