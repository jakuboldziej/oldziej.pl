import { useParams } from 'react-router';
import { useEffect, useState, useContext } from 'react';
import { getDartsGames, getDartsUser } from '@/lib/fetch';
import { UserBarChart } from './UserBarChart';
import Loading from '@/components/Home/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import DartsGamesList from '@/components/Home/Darts/DartsGamesList';
import { Button } from '@/components/ui/shadcn/button';
import { AuthContext } from '@/context/Home/AuthContext';
import { analyzeUserGames, analyzeDailyRewind } from '@/lib/userAnalytics';
import DailyRewind from '@/components/Home/Darts/UserStats/DailyRewind';
import RecentFormCard from '@/components/Home/Darts/UserStats/RecentFormCard';
import PerformanceMetricsCard from '@/components/Home/Darts/UserStats/PerformanceMetricsCard';
import ConsistencyCard from '@/components/Home/Darts/UserStats/ConsistencyCard';
import GameModeCard from '@/components/Home/Darts/UserStats/GameModeCard';
import CheckoutStatsCard from '@/components/Home/Darts/UserStats/CheckoutStatsCard';
import OverallStatsCards from '@/components/Home/Darts/UserStats/OverallStatsCards';
import ThrowStatsCard from '@/components/Home/Darts/UserStats/ThrowStatsCard';

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
  const [analytics, setAnalytics] = useState(null);
  const [dailyRewind, setDailyRewind] = useState(null);

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

      const userAnalytics = analyzeUserGames(resGames, resUser);
      setAnalytics(userAnalytics);

      const dailyStats = analyzeDailyRewind(resGames, resUser);
      setDailyRewind(dailyStats);

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

      if (dartUser) {
        const userAnalytics = analyzeUserGames(resGames, dartUser);
        setAnalytics(userAnalytics);
      }

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
          <DailyRewind dailyRewind={dailyRewind} currentUser={currentUser} username={username} />

          {analytics && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
              <RecentFormCard analytics={analytics} games={games} />
              <PerformanceMetricsCard analytics={analytics} />
            </div>
          )}

          {analytics && Object.keys(analytics.performanceByGameMode).length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
              <ConsistencyCard analytics={analytics} />
              <GameModeCard analytics={analytics} />
            </div>
          )}

          <CheckoutStatsCard analytics={analytics} dartUser={dartUser} />

          <OverallStatsCards
            dartUser={dartUser}
            calculateTotalThrows={calculateTotalThrows}
            calculateAvgPerDart={calculateAvgPerDart}
          />

          <ThrowStatsCard dartUser={dartUser} calculateTotalThrows={calculateTotalThrows} />

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
              <ScrollArea className='h-[600px] overflow-y-auto' style={{ WebkitOverflowScrolling: "touch" }} onScroll={handleScroll}>
                <CardContent className="info p-0 pr-3 md:pr-3">
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