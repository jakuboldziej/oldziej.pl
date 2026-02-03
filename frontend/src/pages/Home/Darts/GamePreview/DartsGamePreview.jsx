import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getDartsGame } from '@/lib/fetch';
import Loading from '@/components/Home/Loading';
import NavBar from '@/components/Home/NavBar';
import MostCommonCheckout from '@/components/Home/Darts/MostCommonCheckout';
import GameHeader from '@/components/Home/Darts/GamePreview/GameHeader';
import GamePodium from '@/components/Home/Darts/GamePreview/GamePodium';
import HeadToHeadComparison from '@/components/Home/Darts/GamePreview/HeadToHeadComparison';
import GameTimeline from '@/components/Home/Darts/GamePreview/GameTimeline';
import PlayerStatistics from '@/components/Home/Darts/GamePreview/PlayerStatistics';
import {
  analyzeGameRecords,
  compareUsers,
  generateTimeline
} from '@/lib/dartsAnalytics';

function DartsGamePreview() {
  const { gameCode } = useParams();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const resGame = await getDartsGame(gameCode);

        if (resGame && resGame.message && !resGame.users) {
          setError(resGame.message);
          setGame(null);
        } else if (resGame && resGame.users) {
          setGame(resGame);
          document.title = `Oldziej | Game ${resGame.gameCode || gameCode}`;
          setError(null);
        } else {
          setError("Game not found");
          setGame(null);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError("Failed to load game data");
        setIsLoading(false);
      }
    }

    fetchGameData();
  }, [gameCode]);

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

  if (!game || error) {
    return (
      <>
        <NavBar />
        <div className='dart-game-preview min-h-screen flex items-center justify-center text-white'>
          <div className='text-center'>
            <div className='mb-6'>
              <svg
                className='w-24 h-24 mx-auto text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h2 className='text-3xl font-bold mb-4'>Game Not Found</h2>
            <p className='text-gray-400 mb-6'>
              {error || `The game with code "${gameCode}" doesn't exist or has been deleted.`}
            </p>
            <a
              href='/darts'
              className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
            >
              Back to Darts Games
            </a>
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

  const analytics = analyzeGameRecords(game);
  const comparison = compareUsers(game);
  const timeline = generateTimeline(game);

  return (
    <>
      <NavBar />
      <div className='dart-game-preview p-6 text-white max-w-7xl mx-auto'>
        <GameHeader game={game} />

        {game.active && (
          <div className='mb-8'>
            <MostCommonCheckout users={game.users} game={game} />
          </div>
        )}

        <GamePodium game={game} />

        <HeadToHeadComparison comparison={comparison} isActive={game.active} />

        <GameTimeline timeline={timeline} />

        <PlayerStatistics
          sortedUsers={sortedUsers}
          game={game}
          analytics={analytics}
          calculateAvgPerDart={calculateAvgPerDart}
        />
      </div>
    </>
  )
}

export default DartsGamePreview
