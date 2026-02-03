import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';

function PerformanceMetricsCard({ analytics }) {
  if (!analytics) return null;

  return (
    <Card className='bg-gray-800 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-lg'>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <MyTooltip title="Percentage of games won">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <img width="25" height="25" src="https://img.icons8.com/color/25/trophy.png" alt="trophy" />
              <span className='text-gray-400'>Win Rate</span>
            </div>
            <span className='text-2xl font-bold text-green-400'>{analytics.winRate}%</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Average points scored per dart thrown">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <img width="25" height="25" src="https://img.icons8.com/fluency/25/average-2.png" alt="efficiency" />
              <span className='text-gray-400'>Points/Dart</span>
            </div>
            <span className='text-2xl font-bold'>{analytics.efficiency.pointsPerDart}</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Percentage of darts that scored points">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <img width="25" height="25" src="https://img.icons8.com/color/25/checked.png" alt="accuracy" />
              <span className='text-gray-400'>Accuracy</span>
            </div>
            <span className='text-2xl font-bold text-blue-400'>{analytics.efficiency.accuracy}%</span>
          </div>
        </MyTooltip>
        <MyTooltip title="Checkouts per game played">
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <img width="25" height="25" src="https://img.icons8.com/color/25/cash-register.png" alt="checkout" />
              <span className='text-gray-400'>Checkout Rate</span>
            </div>
            <span className='text-2xl font-bold'>{analytics.checkoutStats.checkoutRate}</span>
          </div>
        </MyTooltip>
      </CardContent>
    </Card>
  );
}

export default PerformanceMetricsCard;
