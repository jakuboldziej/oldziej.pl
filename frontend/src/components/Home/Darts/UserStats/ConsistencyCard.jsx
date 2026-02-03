import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';

function ConsistencyCard({ analytics }) {
  if (!analytics) return null;

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-lg'>Consistency Analysis</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <MyTooltip title="Standard deviation of your game averages">
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Consistency Score</span>
            <span className='text-xl font-bold'>±{analytics.consistency.stdDev}</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Your best game average">
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Best Game</span>
            <span className='text-xl font-bold text-green-400'>{analytics.consistency.bestGameAvg}</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Your worst game average">
          <div className='flex justify-between items-center'>
            <span className='text-gray-400'>Worst Game</span>
            <span className='text-xl font-bold text-red-400'>{analytics.consistency.worstGameAvg}</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Difference between best and worst">
          <div className='flex justify-between items-center pt-2 border-t border-gray-700'>
            <span className='text-gray-400'>Range</span>
            <span className='text-xl font-bold'>{analytics.consistency.avgDifference}</span>
          </div>
        </MyTooltip>
      </CardContent>
    </Card>
  );
}

export default ConsistencyCard;
