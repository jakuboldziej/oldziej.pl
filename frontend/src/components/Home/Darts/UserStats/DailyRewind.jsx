import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';

function DailyRewind({ dailyRewind, currentUser, username }) {
  if (!dailyRewind || !currentUser || currentUser.displayName !== username) {
    return null;
  }

  return (
    <Card className='bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700 mb-8'>
      <CardHeader>
        <CardTitle className='text-2xl flex items-center gap-2'>
          <span>📅</span>
          <span>Today's Rewind</span>
          <Badge variant="outline" className='ml-2'>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gray-800/50 p-4 rounded-lg text-center'>
            <p className='text-gray-400 text-sm mb-1'>Games Played</p>
            <p className='text-3xl font-bold'>{dailyRewind.totalGames}</p>
          </div>
          <div className='bg-gray-800/50 p-4 rounded-lg text-center'>
            <p className='text-gray-400 text-sm mb-1'>Win Rate</p>
            <p className='text-3xl font-bold text-green-400'>{dailyRewind.winRate}%</p>
          </div>
          <div className='bg-gray-800/50 p-4 rounded-lg text-center'>
            <p className='text-gray-400 text-sm mb-1'>Average</p>
            <p className='text-3xl font-bold text-blue-400'>{dailyRewind.avgAverage}</p>
          </div>
          <div className='bg-gray-800/50 p-4 rounded-lg text-center'>
            <p className='text-gray-400 text-sm mb-1'>Highest Avg</p>
            <p className='text-3xl font-bold text-yellow-400'>{dailyRewind.highestAvg.toFixed(2)}</p>
          </div>
        </div>

        {Object.keys(dailyRewind.opponents).length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span>🎯</span>
              <span>Head-to-Head Today</span>
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {Object.entries(dailyRewind.opponents).map(([opponentName, stats]) => (
                <div key={opponentName} className='bg-gray-800/50 p-4 rounded-lg'>
                  <div className='flex justify-between items-start mb-2'>
                    <p className='font-semibold text-lg'>{opponentName}</p>
                    <Badge variant={stats.wins > stats.losses ? "default" : "destructive"}>
                      {stats.games} games
                    </Badge>
                  </div>
                  <div className='flex justify-around mt-3'>
                    <div className='text-center'>
                      <p className='text-gray-400 text-xs mb-1'>Wins</p>
                      <p className='text-xl font-bold text-green-400'>{stats.wins}</p>
                    </div>
                    <div className='text-gray-400 text-2xl'>-</div>
                    <div className='text-center'>
                      <p className='text-gray-400 text-xs mb-1'>Losses</p>
                      <p className='text-xl font-bold text-red-400'>{stats.losses}</p>
                    </div>
                  </div>
                  {stats.wins + stats.losses === stats.games && (
                    <div className='mt-2 text-center'>
                      <p className='text-sm text-gray-400'>
                        Win Rate: <span className='font-bold text-white'>
                          {stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(0) : 0}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyRewind;
