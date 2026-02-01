import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getDartsGame } from '@/lib/fetch';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import Loading from '@/components/Home/Loading';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import NavBar from '@/components/Home/NavBar';
import MostCommonCheckout from '@/components/Home/Darts/MostCommonCheckout';

function DartsGamePreview() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const resGame = await getDartsGame(gameId);
        setGame(resGame);
        document.title = `Oldziej | Game ${resGame.gameCode || gameId}`;
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setIsLoading(false);
      }
    }

    fetchGameData();
  }, [gameId]);

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className='dart-game-preview min-h-screen flex items-center justify-center'>
          <Loading />
        </div>
      </>
    );
  }

  if (!game) {
    return (
      <>
        <NavBar />
        <div className='dart-game-preview min-h-screen flex items-center justify-center text-white'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-4'>Game Not Found</h2>
            <p>The game you're looking for doesn't exist or has been deleted.</p>
          </div>
        </div>
      </>
    );
  }

  const sortedUsers = [...game.users].sort((a, b) => {
    if (a.place === 0 && b.place === 0) return 0;
    if (a.place === 0) return 1;
    if (b.place === 0) return -1;
    return a.place - b.place;
  });

  const calculateAvgPerDart = (user) => {
    const totalDarts = user.throws.normal + user.throws.doubles + user.throws.triples + user.throws.doors;
    if (totalDarts === 0) return "0.00";
    return (user.allGainedPoints / totalDarts).toFixed(2);
  };

  return (
    <>
      <NavBar />
      <div className='dart-game-preview p-6 text-white max-w-7xl mx-auto'>
        <div className='header mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold mb-2'>
                Game Preview
                {game.gameCode && <span className='text-gray-400 ml-3'>#{game.gameCode}</span>}
              </h1>
              <div className='flex gap-3 items-center'>
                <Badge variant={game.active ? "default" : "secondary"}>
                  {game.active ? "Active" : "Finished"}
                </Badge>
                {game.training && <Badge variant="outline">Training</Badge>}
                <span className='text-gray-400'>
                  {new Date(game.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Card className='bg-gray-800 border-gray-700'>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                <div>
                  <p className='text-gray-400 text-sm'>Game Mode</p>
                  <p className='text-xl font-bold'>{game.gameMode}</p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Start Points</p>
                  <p className='text-xl font-bold'>{game.startPoints}</p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Check Out</p>
                  <p className='text-xl font-bold'>{game.checkOut}</p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Sets/Legs</p>
                  <p className='text-xl font-bold'>{game.sets}/{game.legs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {game.active && (
          <div className='mb-8'>
            <MostCommonCheckout users={game.users} game={game} />
          </div>
        )}

        {!game.active && game.podium && game.podium[1] && (
          <Card className='bg-gray-800 border-gray-700 mb-8'>
            <CardHeader>
              <CardTitle>Podium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-center items-end gap-8'>
                {game.podium[2] && (
                  <div className='text-center flex flex-col items-center'>
                    <img width="60" height="60" src="https://img.icons8.com/color/60/second-place-ribbon.png" alt="second-place" />
                    <p className='text-xl font-bold mt-2'>{game.podium[2]}</p>
                    <p className='text-gray-400 text-sm'>2nd Place</p>
                  </div>
                )}

                <div className='text-center flex flex-col items-center'>
                  <img width="80" height="80" src="https://img.icons8.com/color/80/first-place-ribbon.png" alt="first-place" />
                  <p className='text-2xl font-bold mt-2'>{game.podium[1]}</p>
                  <p className='text-gray-400'>1st Place</p>
                </div>

                {game.podium[3] && (
                  <div className='text-center flex flex-col items-center'>
                    <img width="60" height="60" src="https://img.icons8.com/color/60/third-place-ribbon.png" alt="third-place" />
                    <p className='text-xl font-bold mt-2'>{game.podium[3]}</p>
                    <p className='text-gray-400 text-sm'>3rd Place</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className='bg-gray-800 border-gray-700'>
          <CardHeader>
            <CardTitle>Players Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[600px]'>
              <div className='space-y-4 pr-4'>
                {sortedUsers.map((user, index) => (
                  <Card key={index} className='bg-gray-900 border-gray-700'>
                    <CardContent className='pt-6'>
                      <div className='flex justify-between items-start mb-4'>
                        <div>
                          <h3 className='text-2xl font-bold mb-1'>{user.displayName}</h3>
                          {user.place > 0 && (
                            <Badge variant="outline">Place: {user.place}</Badge>
                          )}
                          {user.temporary && (
                            <Badge variant="secondary" className='ml-2'>Guest</Badge>
                          )}
                        </div>
                        <div className='text-right'>
                          <p className='text-gray-400 text-sm'>Points</p>
                          <p className='text-3xl font-bold'>{user.points}</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                        <MyTooltip title="Average per throw">
                          <div className='text-center bg-gray-800 p-3 rounded'>
                            <p className='text-gray-400 text-xs mb-1'>Avg/Dart</p>
                            <p className='text-lg font-bold'>{calculateAvgPerDart(user)}</p>
                          </div>
                        </MyTooltip>

                        <MyTooltip title="Average per turn">
                          <div className='text-center bg-gray-800 p-3 rounded'>
                            <p className='text-gray-400 text-xs mb-1'>Avg/Turn</p>
                            <p className='text-lg font-bold'>{user.avgPointsPerTurn || "0.00"}</p>
                          </div>
                        </MyTooltip>

                        <MyTooltip title="Total points gained">
                          <div className='text-center bg-gray-800 p-3 rounded'>
                            <p className='text-gray-400 text-xs mb-1'>Gained</p>
                            <p className='text-lg font-bold'>{user.allGainedPoints}</p>
                          </div>
                        </MyTooltip>

                        <MyTooltip title="Checkout points">
                          <div className='text-center bg-gray-800 p-3 rounded'>
                            <p className='text-gray-400 text-xs mb-1'>Checkout</p>
                            <p className='text-lg font-bold'>{user.gameCheckout || 0}</p>
                          </div>
                        </MyTooltip>
                      </div>

                      {/* Throws Stats */}
                      <div className='mb-4'>
                        <p className='text-gray-400 text-sm mb-2'>Throw Statistics</p>
                        <div className='grid grid-cols-5 gap-2'>
                          <MyTooltip title="Normal throws">
                            <div className='text-center bg-gray-800 p-2 rounded'>
                              <p className='text-xs text-gray-400'>Normal</p>
                              <p className='font-bold'>{user.throws.normal}</p>
                            </div>
                          </MyTooltip>

                          <MyTooltip title="Double throws">
                            <div className='text-center bg-gray-800 p-2 rounded'>
                              <p className='text-xs text-gray-400'>Doubles</p>
                              <p className='font-bold'>{user.throws.doubles}</p>
                            </div>
                          </MyTooltip>

                          <MyTooltip title="Triple throws">
                            <div className='text-center bg-gray-800 p-2 rounded'>
                              <p className='text-xs text-gray-400'>Triples</p>
                              <p className='font-bold'>{user.throws.triples}</p>
                            </div>
                          </MyTooltip>

                          <MyTooltip title="Door hits">
                            <div className='text-center bg-gray-800 p-2 rounded'>
                              <p className='text-xs text-gray-400'>Doors</p>
                              <p className='font-bold'>{user.throws.doors}</p>
                            </div>
                          </MyTooltip>

                          {user.throws.overthrows !== undefined && (
                            <MyTooltip title="Overthrows">
                              <div className='text-center bg-gray-800 p-2 rounded'>
                                <p className='text-xs text-gray-400'>Over</p>
                                <p className='font-bold'>{user.throws.overthrows}</p>
                              </div>
                            </MyTooltip>
                          )}
                        </div>
                      </div>

                      {/* Last Turn */}
                      {user.turns && (
                        <div>
                          <p className='text-gray-400 text-sm mb-2'>Last Turn</p>
                          <div className='flex gap-2'>
                            {[1, 2, 3].map((turnNum) => (
                              <div key={turnNum} className='bg-gray-800 p-3 rounded flex-1 text-center'>
                                <p className='text-xl font-bold'>
                                  {user.turns[turnNum] !== null && user.turns[turnNum] !== undefined
                                    ? user.turns[turnNum]
                                    : '-'}
                                </p>
                              </div>
                            ))}
                            <div className='bg-blue-900 p-3 rounded flex-1 text-center'>
                              <p className='text-xs text-gray-400 mb-1'>Sum</p>
                              <p className='text-xl font-bold'>{user.turnsSum || 0}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sets and Legs */}
                      {game.gameMode === "X01" && (user.sets > 0 || user.legs > 0) && (
                        <div className='mt-4 flex gap-4 justify-center'>
                          <div className='text-center'>
                            <p className='text-gray-400 text-xs'>Sets</p>
                            <p className='text-lg font-bold'>{user.sets}</p>
                          </div>
                          <div className='text-center'>
                            <p className='text-gray-400 text-xs'>Legs</p>
                            <p className='text-lg font-bold'>{user.legs}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DartsGamePreview
