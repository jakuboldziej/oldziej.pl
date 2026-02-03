import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';

function RecentFormCard({ analytics, games }) {
  if (!analytics) return null;

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-lg flex items-center justify-between'>
          <span>Recent Form</span>
          <Badge variant={parseFloat(analytics.recentForm.trend) > 0 ? "default" : "destructive"}>
            {parseFloat(analytics.recentForm.trend) > 0 ? "↑" : "↓"} {Math.abs(analytics.recentForm.trend)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>
          <p className='text-gray-400 text-sm mb-2'>Last 5 Games Average</p>
          <p className='text-3xl font-bold'>{analytics.recentForm.avgLast5}</p>
        </div>
        <div className='space-y-2'>
          {analytics.recentForm.last5Games.map((game, idx) => (
            <div key={game.gameCode} className='flex justify-between items-center bg-gray-900 p-2 rounded'>
              <span className='text-sm text-gray-400'>Game #{games.length - idx}</span>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>{game.avg}</span>
                {!game.active && game.place === 1 && (
                  <img width="20" height="20" src="https://img.icons8.com/color/20/first-place-ribbon.png" alt="win" />
                )}
                {!game.active && game.place === 2 && (
                  <img width="20" height="20" src="https://img.icons8.com/color/20/second-place-ribbon.png" alt="second" />
                )}
                {!game.active && game.place === 3 && (
                  <img width="20" height="20" src="https://img.icons8.com/color/20/third-place-ribbon.png" alt="third" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentFormCard;
