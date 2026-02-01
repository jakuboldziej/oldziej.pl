import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { TabsContent } from '@/components/ui/shadcn/tabs';

function PlayerHistory({ userAnalytics }) {
  return (
    <TabsContent value="history" className="space-y-2">
      {userAnalytics && userAnalytics.turnHistory.length > 0 ? (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {userAnalytics.turnHistory.map((turn, idx) => (
              <div key={idx} className='bg-gray-800 p-3 rounded flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                  <div className='text-center'>
                    <p className='text-xs text-gray-400'>Round</p>
                    <p className='font-bold'>{turn.round}</p>
                  </div>
                  <div className='flex gap-2'>
                    {Object.values(turn.throws).map((t, i) => (
                      <div key={i} className='bg-gray-900 px-2 py-1 rounded min-w-[40px] text-center'>
                        <p className='text-sm'>{t || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-green-400'>+{turn.points}</p>
                  <p className='text-xs text-gray-400'>{turn.remainingPoints} left</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className='text-center text-gray-400 py-8'>
          No turn history available yet
        </div>
      )}
    </TabsContent>
  );
}

export default PlayerHistory;
