import { useParams } from 'react-router';
import { useEffect, useState, useContext } from 'react';
import { getDartsGames, getDartsUser } from '@/lib/fetch';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { UserBarChart } from './UserBarChart';
import Loading from '@/components/Home/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import DartsGamesList from '@/components/Home/Darts/DartsGamesList';
import { Button } from '@/components/ui/shadcn/button';
import { AuthContext } from '@/context/Home/AuthContext';

function DartsUser() {
  const { username } = useParams();
  const { currentUser } = useContext(AuthContext);

  document.title = `Oldziej | ${username}`
  const [dartUser, setDartUser] = useState();
  const [games, setGames] = useState([]);
  const [gamesShown, setGamesShown] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [trainingFilter, setTrainingFilter] = useState('competitive');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setCurrentPage(1);
      const resUser = await getDartsUser(username);
      const resGames = await getDartsGames(username, 0, trainingFilter);
      resUser.games = resGames;
      setDartUser(resUser);
      setGames(resGames);
      setGamesShown(resGames.slice(0, 20));
      setIsLoading(false);
    }

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGames(true);
      setCurrentPage(1);
      const resGames = await getDartsGames(username, 0, trainingFilter);
      setGames(resGames);
      setGamesShown(resGames.slice(0, 20));
      setIsLoadingGames(false);
    }

    if (dartUser) {
      fetchGames();
    }
  }, [trainingFilter]);

  useEffect(() => {
    setGamesShown(games.slice(0, 20 * currentPage));
  }, [currentPage, games]);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (!isLoading && gamesShown.length < games.length) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }
  };

  const calculateTotalThrows = () => {
    if (!dartUser) return 0;
    return dartUser.throws.normal + dartUser.throws.doubles + dartUser.throws.triples + dartUser.throws.doors;
  };

  const calculateAvgPerDart = () => {
    const total = calculateTotalThrows();
    if (total === 0) return "0.00";
    return (dartUser.overAllPoints / total).toFixed(2);
  };

  return (
    <div className='dart-user p-6 text-white max-w-7xl mx-auto'>
      <div className='header mb-8'>
        <h1 className='text-4xl font-bold mb-2'>{username}</h1>
      </div>
      {isLoading ? (
        <Loading />
      ) :
        <div className='darts-page'>
          {/* Overall Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            {/* Podiums Card */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-lg'>Podiums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex justify-around'>
                  <MyTooltip title="First Place">
                    <div className='text-center'>
                      <img width="40" height="40" src="https://img.icons8.com/color/40/first-place-ribbon.png" alt="first-place" className='mx-auto mb-1' />
                      <p className='text-2xl font-bold'>{dartUser.podiums.firstPlace}</p>
                    </div>
                  </MyTooltip>
                  <MyTooltip title="Second Place">
                    <div className='text-center'>
                      <img width="40" height="40" src="https://img.icons8.com/color/40/second-place-ribbon.png" alt="second-place" className='mx-auto mb-1' />
                      <p className='text-2xl font-bold'>{dartUser.podiums.secondPlace}</p>
                    </div>
                  </MyTooltip>
                  <MyTooltip title="Third Place">
                    <div className='text-center'>
                      <img width="40" height="40" src="https://img.icons8.com/color/40/third-place-ribbon.png" alt="third-place" className='mx-auto mb-1' />
                      <p className='text-2xl font-bold'>{dartUser.podiums.thirdPlace}</p>
                    </div>
                  </MyTooltip>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats Card */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-lg'>Performance</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <MyTooltip title="Highest Ending Average">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/arcade/25/graph.png" alt="graph" />
                      <span className='text-gray-400'>Best Avg</span>
                    </div>
                    <span className='text-xl font-bold'>{dartUser.highestEndingAvg}</span>
                  </div>
                </MyTooltip>
                <MyTooltip title="Highest Turn Points">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/color/25/mountain.png" alt="mountain" />
                      <span className='text-gray-400'>Best Turn</span>
                    </div>
                    <span className='text-xl font-bold'>{dartUser.highestTurnPoints}</span>
                  </div>
                </MyTooltip>
                <MyTooltip title="Highest Checkout">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/color/25/cash-register.png" alt="checkout" />
                      <span className='text-gray-400'>Best Checkout</span>
                    </div>
                    <span className='text-xl font-bold'>{dartUser.highestCheckout}</span>
                  </div>
                </MyTooltip>
              </CardContent>
            </Card>

            {/* Games & Points Card */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-lg'>Overall</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <MyTooltip title="Total Games Played">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/color/25/goal--v1.png" alt="games" />
                      <span className='text-gray-400'>Games</span>
                    </div>
                    <span className='text-xl font-bold'>{dartUser.gamesPlayed}</span>
                  </div>
                </MyTooltip>
                <MyTooltip title="Total Points Scored">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/color/25/goal.png" alt="points" />
                      <span className='text-gray-400'>Points</span>
                    </div>
                    <span className='text-xl font-bold'>{dartUser.overAllPoints.toLocaleString()}</span>
                  </div>
                </MyTooltip>
                <MyTooltip title="Average Per Dart">
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <img width="25" height="25" src="https://img.icons8.com/fluency/25/average-2.png" alt="average" />
                      <span className='text-gray-400'>Avg/Dart</span>
                    </div>
                    <span className='text-xl font-bold'>{calculateAvgPerDart()}</span>
                  </div>
                </MyTooltip>
              </CardContent>
            </Card>
          </div>

          {/* Throw Statistics */}
          <Card className='bg-gray-800 border-gray-700 mb-8'>
            <CardHeader>
              <CardTitle>Throw Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                <div className='text-center bg-gray-900 p-4 rounded'>
                  <p className='text-gray-400 text-sm mb-2'>Normal</p>
                  <p className='text-3xl font-bold'>{dartUser.throws.normal.toLocaleString()}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {((dartUser.throws.normal / calculateTotalThrows()) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className='text-center bg-gray-900 p-4 rounded'>
                  <p className='text-gray-400 text-sm mb-2'>Doubles</p>
                  <p className='text-3xl font-bold text-blue-400'>{dartUser.throws.doubles.toLocaleString()}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {((dartUser.throws.doubles / calculateTotalThrows()) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className='text-center bg-gray-900 p-4 rounded'>
                  <p className='text-gray-400 text-sm mb-2'>Triples</p>
                  <p className='text-3xl font-bold text-green-400'>{dartUser.throws.triples.toLocaleString()}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {((dartUser.throws.triples / calculateTotalThrows()) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className='text-center bg-gray-900 p-4 rounded'>
                  <MyTooltip title="Door Hits">
                    <div>
                      <div className='flex items-center justify-center gap-1 mb-2'>
                        <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                        <p className='text-gray-400 text-sm'>Doors</p>
                      </div>
                      <p className='text-3xl font-bold text-green'>{dartUser.throws.doors.toLocaleString()}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {((dartUser.throws.doors / calculateTotalThrows()) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </MyTooltip>
                </div>
                {dartUser.throws.overthrows !== undefined && (
                  <div className='text-center bg-gray-900 p-4 rounded'>
                    <p className='text-gray-400 text-sm mb-2'>Overthrows</p>
                    <p className='text-3xl font-bold text-red-400'>{dartUser.throws.overthrows.toLocaleString()}</p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {((dartUser.throws.overthrows / calculateTotalThrows()) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
              <div className='mt-4 text-center'>
                <p className='text-gray-400'>Total Darts Thrown</p>
                <p className='text-2xl font-bold'>{calculateTotalThrows().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Games */}
          <div className='cards'>
            <Card className='my-card games !w-full'>
              <CardHeader>
                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <CardTitle>Recent Games ({gamesShown.length})</CardTitle>
                  {currentUser?.displayName === username && (
                    <div className='flex gap-2'>
                      <Button
                        variant={trainingFilter === 'competitive' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTrainingFilter('competitive')}
                        className='text-xs'
                      >
                        Competitive
                      </Button>
                      <Button
                        variant={trainingFilter === 'training' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTrainingFilter('training')}
                        className='text-xs'
                      >
                        Training
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <ScrollArea className='h-[600px]' onScroll={handleScroll}>
                <CardContent className="info p-0 pr-3">
                  <DartsGamesList games={gamesShown} isLoading={isLoadingGames} />
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Charts */}
          <div className='charts w-[99%] pb-10'>
            <UserBarChart dartUser={dartUser} />
          </div>
        </div>
      }
    </div>
  )
}

export default DartsUser