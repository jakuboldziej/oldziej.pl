import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';

function OverallStatsCards({ dartUser }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
      {/* Podiums Card */}
      <Card className='bg-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-lg'>Podiums</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex justify-around'>
            <MyTooltip title="First Place">
              <div className='text-center'>
                <img width="40" height="40" src="https://img.icons8.com/color/40/first-place-ribbon.png" alt="first-place" className='mx-auto mb-1' />
                <p className='text-2xl font-bold'>{dartUser.podiums.firstPlace}</p>
              </div>
            </MyTooltip>
            <MyTooltip title="Second Place">
              <div className='text-center'>
                <img width="40" height="40" src="https://img.icons8.com/color/40/second-place-ribbon.png" alt="second-place" className='mx-auto mb-1' />
                <p className='text-2xl font-bold'>{dartUser.podiums.secondPlace}</p>
              </div>
            </MyTooltip>
            <MyTooltip title="Third Place">
              <div className='text-center'>
                <img width="40" height="40" src="https://img.icons8.com/color/40/third-place-ribbon.png" alt="third-place" className='mx-auto mb-1' />
                <p className='text-2xl font-bold'>{dartUser.podiums.thirdPlace}</p>
              </div>
            </MyTooltip>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats Card */}
      <Card className='bg-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-lg'>Performance</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <MyTooltip title="Highest Ending Average">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <img width="25" height="25" src="https://img.icons8.com/arcade/25/graph.png" alt="graph" />
                <span className='text-gray-400'>Best Avg</span>
              </div>
              <span className='text-xl font-bold'>{dartUser.highestEndingAvg}</span>
            </div>
          </MyTooltip>
          <MyTooltip title="Highest Turn Points">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <img width="25" height="25" src="https://img.icons8.com/color/25/mountain.png" alt="mountain" />
                <span className='text-gray-400'>Best Turn</span>
              </div>
              <span className='text-xl font-bold'>{dartUser.highestTurnPoints}</span>
            </div>
          </MyTooltip>
          <MyTooltip title="Highest Checkout">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <img width="25" height="25" src="https://img.icons8.com/color/25/cash-register.png" alt="checkout" />
                <span className='text-gray-400'>Best Checkout</span>
              </div>
              <span className='text-xl font-bold'>{dartUser.highestCheckout}</span>
            </div>
          </MyTooltip>
        </CardContent>
      </Card>

      {/* Games & Points Card */}
      <Card className='bg-gray-800 border-gray-700'>
        <CardHeader>
          <CardTitle className='text-lg'>Overall</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <MyTooltip title="Total Games Played">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <img width="25" height="25" src="https://img.icons8.com/color/25/goal--v1.png" alt="games" />
                <span className='text-gray-400'>Games</span>
              </div>
              <span className='text-xl font-bold'>{dartUser.gamesPlayed}</span>
            </div>
          </MyTooltip>
          <MyTooltip title="Total Points Scored">
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <img width="25" height="25" src="https://img.icons8.com/color/25/goal.png" alt="points" />
                <span className='text-gray-400'>Points</span>
              </div>
              <span className='text-xl font-bold'>{dartUser.overAllPoints.toLocaleString()}</span>
            </div>
          </MyTooltip>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverallStatsCards;
