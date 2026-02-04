import { Badge } from '@/components/ui/shadcn/badge';
import { Card, CardContent } from '@/components/ui/shadcn/card';

function GameHeader({ game }) {
  return (
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
            {game.finished_at && (
              <>
                <span>-</span>
                <span className='text-gray-400'>
                  {new Date(game.finished_at).toLocaleString()}
                </span>
              </>
            )}
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
  );
}

export default GameHeader;
