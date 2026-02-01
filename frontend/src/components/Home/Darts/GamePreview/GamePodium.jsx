import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

function GamePodium({ game }) {
  if (game.active || !game.podium || !game.podium[1]) return null;

  return (
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
  );
}

export default GamePodium;
