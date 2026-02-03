import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Badge } from '@/components/ui/shadcn/badge';

function GameModeCard({ analytics }) {
  if (!analytics || Object.keys(analytics.performanceByGameMode).length === 0) {
    return null;
  }

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-lg'>Performance by Game Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[200px]'>
          <div className='space-y-3 pr-4'>
            {Object.entries(analytics.performanceByGameMode).map(([mode, stats]) => (
              <div key={mode} className='bg-gray-900 p-3 rounded'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-semibold'>{mode}</span>
                  <Badge variant="outline">{stats.games} games</Badge>
                </div>
                <div className='grid grid-cols-3 gap-2 text-sm'>
                  <div className='text-center'>
                    <p className='text-gray-400 text-xs'>Avg</p>
                    <p className='font-bold'>{stats.avgAvg}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-gray-400 text-xs'>Wins</p>
                    <p className='font-bold text-green-400'>{stats.wins}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-gray-400 text-xs'>Win Rate</p>
                    <p className='font-bold text-blue-400'>{stats.winRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default GameModeCard;
