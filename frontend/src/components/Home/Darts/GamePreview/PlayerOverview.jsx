import MyTooltip from '@/components/Home/MyComponents/MyTooltip';
import { TabsContent } from '@/components/ui/shadcn/tabs';

function PlayerOverview({ user, game, scoringBreakdown }) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <MyTooltip title="Average per turn">
          <div className='text-center bg-gray-800 p-3 rounded'>
            <p className='text-gray-400 text-xs mb-1'>Avg/Turn</p>
            <p className='text-lg font-bold'>{user.avgPointsPerTurn || "0.00"}</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Highest Turn Points">
          <div className='text-center bg-gray-800 p-3 rounded'>
            <p className='text-gray-400 text-xs mb-1'>Highest Turn Points</p>
            <p className='text-lg font-bold'>{user.highestGameTurnPoints || "0.00"}</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Total points gained">
          <div className='text-center bg-gray-800 p-3 rounded'>
            <p className='text-gray-400 text-xs mb-1'>Gained</p>
            <p className='text-lg font-bold'>{user.allGainedPoints}</p>
          </div>
        </MyTooltip>

        <MyTooltip title="Checkout points">
          <div className='text-center bg-gray-800 p-3 rounded'>
            <p className='text-gray-400 text-xs mb-1'>Checkout</p>
            <p className='text-lg font-bold'>{user.gameCheckout || 0}</p>
          </div>
        </MyTooltip>
      </div>

      <div>
        <p className='text-gray-400 text-sm mb-2'>Throw Statistics</p>
        <div className='grid grid-cols-5 gap-2'>
          <MyTooltip title="Normal throws">
            <div className='text-center bg-gray-800 p-2 rounded'>
              <p className='text-xs text-gray-400'>Normal</p>
              <p className='font-bold'>{user.throws.normal}</p>
              {scoringBreakdown && <p className='text-xs text-green-400'>{scoringBreakdown.normal.percentage}%</p>}
            </div>
          </MyTooltip>

          <MyTooltip title="Double throws">
            <div className='text-center bg-gray-800 p-2 rounded'>
              <p className='text-xs text-gray-400'>Doubles</p>
              <p className='font-bold'>{user.throws.doubles}</p>
              {scoringBreakdown && <p className='text-xs text-blue-400'>{scoringBreakdown.doubles.percentage}%</p>}
            </div>
          </MyTooltip>

          <MyTooltip title="Triple throws">
            <div className='text-center bg-gray-800 p-2 rounded'>
              <p className='text-xs text-gray-400'>Triples</p>
              <p className='font-bold'>{user.throws.triples}</p>
              {scoringBreakdown && <p className='text-xs text-purple-400'>{scoringBreakdown.triples.percentage}%</p>}
            </div>
          </MyTooltip>

          <MyTooltip title="Door hits">
            <div className='text-center bg-gray-800 p-2 rounded'>
              <p className='text-xs text-gray-400'>Doors</p>
              <p className='font-bold'>{user.throws.doors}</p>
              {scoringBreakdown && <p className='text-xs text-red-400'>{scoringBreakdown.doors.percentage}%</p>}
            </div>
          </MyTooltip>

          {user.throws.overthrows !== undefined && (
            <MyTooltip title="Overthrows">
              <div className='text-center bg-gray-800 p-2 rounded'>
                <p className='text-xs text-gray-400'>Over</p>
                <p className='font-bold'>{user.throws.overthrows}</p>
              </div>
            </MyTooltip>
          )}
        </div>
      </div>

      {user.turns && (
        <div>
          <p className='text-gray-400 text-sm mb-2'>Current Turn</p>
          <div className='flex gap-2'>
            {[1, 2, 3].map((turnNum) => (
              <div key={turnNum} className='bg-gray-800 p-3 rounded flex-1 text-center'>
                <p className='text-xl font-bold'>
                  {user.turns[turnNum] !== null && user.turns[turnNum] !== undefined
                    ? user.turns[turnNum]
                    : '-'}
                </p>
              </div>
            ))}
            <div className='bg-blue-900 p-3 rounded flex-1 text-center'>
              <p className='text-xs text-gray-400 mb-1'>Sum</p>
              <p className='text-xl font-bold'>{user.turnsSum || 0}</p>
            </div>
          </div>
        </div>
      )}

      {game.gameMode === "X01" && (user.sets > 0 || user.legs > 0) && (
        <div className='flex gap-4 justify-center'>
          <div className='text-center'>
            <p className='text-gray-400 text-xs'>Sets</p>
            <p className='text-lg font-bold'>{user.sets}</p>
          </div>
          <div className='text-center'>
            <p className='text-gray-400 text-xs'>Legs</p>
            <p className='text-lg font-bold'>{user.legs}</p>
          </div>
        </div>
      )}
    </TabsContent>
  );
}

export default PlayerOverview;
