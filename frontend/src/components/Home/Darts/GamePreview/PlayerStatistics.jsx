import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import PlayerCard from './PlayerCard';

function PlayerStatistics({ sortedUsers, game, analytics, calculateAvgPerDart }) {
  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle>Players Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[600px]'>
          <div className='space-y-4 pr-4'>
            {sortedUsers.map((user, index) => (
              <PlayerCard
                key={index}
                user={user}
                game={game}
                analytics={analytics}
                calculateAvgPerDart={calculateAvgPerDart}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PlayerStatistics;
