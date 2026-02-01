import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { TabsContent } from '@/components/ui/shadcn/tabs';

function PlayerEfficiency({ efficiency, userAnalytics }) {
  return (
    <TabsContent value="efficiency" className="space-y-4">
      <div className='grid grid-cols-2 gap-4'>
        <MyTooltip title="Points scored per dart thrown">
          <div className='text-center bg-gray-800 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Points/Dart</p>
            <p className='text-2xl font-bold text-green-400'>{efficiency.pointsPerDart}</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Darts needed per point scored">
          <div className='text-center bg-gray-800 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Darts/Point</p>
            <p className='text-2xl font-bold text-blue-400'>{efficiency.dartsPerPoint}</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Accuracy percentage (non-wasted darts)">
          <div className='text-center bg-gray-800 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Accuracy</p>
            <p className='text-2xl font-bold text-purple-400'>{efficiency.accuracy}%</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Total wasted darts (doors + overthrows)">
          <div className='text-center bg-gray-800 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Wasted</p>
            <p className='text-2xl font-bold text-red-400'>{efficiency.wastedDarts}</p>
          </div>
        </MyTooltip>
      </div>

      {userAnalytics && (
        <>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <MyTooltip title="Best single turn score">
              <div className='text-center bg-gray-800 p-4 rounded'>
                <p className='text-gray-400 text-sm mb-2'>Best Turn</p>
                <p className='text-2xl font-bold text-yellow-400'>{userAnalytics.bestTurn}</p>
              </div>
            </MyTooltip>

            <MyTooltip title="Worst single turn score">
              <div className='text-center bg-gray-800 p-4 rounded'>
                <p className='text-gray-400 text-sm mb-2'>Worst Turn</p>
                <p className='text-2xl font-bold'>{userAnalytics.worstTurn}</p>
              </div>
            </MyTooltip>
          </div>

          <MyTooltip title="Lower is more consistent">
            <div className='text-center bg-gray-800 p-4 rounded'>
              <p className='text-gray-400 text-sm mb-2'>Consistency (Std Dev)</p>
              <p className='text-2xl font-bold text-cyan-400'>{userAnalytics.consistency}</p>
            </div>
          </MyTooltip>

          {userAnalytics.progressionRate !== 0 && (
            <MyTooltip title="Performance trend over time">
              <div className='text-center bg-gray-800 p-4 rounded'>
                <p className='text-gray-400 text-sm mb-2'>Progression Rate</p>
                <p className={`text-2xl font-bold ${userAnalytics.progressionRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userAnalytics.progressionRate > 0 ? '+' : ''}{userAnalytics.progressionRate}%
                </p>
              </div>
            </MyTooltip>
          )}
        </>
      )}
    </TabsContent>
  );
}

export default PlayerEfficiency;
