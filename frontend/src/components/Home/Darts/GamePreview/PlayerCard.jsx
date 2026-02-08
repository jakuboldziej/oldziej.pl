import { Badge } from '@/components/ui/shadcn/badge';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import PlayerOverview from './PlayerOverview';
import PlayerEfficiency from './PlayerEfficiency';
import PlayerHistory from './PlayerHistory';
import { calculateEfficiency, getScoringBreakdown } from '@/lib/dartsAnalytics';

function PlayerCard({ user, game, analytics }) {
  const efficiency = calculateEfficiency(user);
  const scoringBreakdown = getScoringBreakdown(user);
  const userAnalytics = analytics?.[user.displayName];

  return (
    <Card className='bg-gray-900 border-gray-700'>
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <PlayerOverview
            user={user}
            game={game}
            scoringBreakdown={scoringBreakdown}
          />

          <PlayerEfficiency
            efficiency={efficiency}
            userAnalytics={userAnalytics}
          />

          <PlayerHistory
            userAnalytics={userAnalytics}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PlayerCard;
