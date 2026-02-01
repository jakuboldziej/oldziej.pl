import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';

function GameTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <Card className='bg-gray-800 border-gray-700 mb-8'>
      <CardHeader>
        <CardTitle>Game Timeline - Turn by Turn</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[400px]'>
          <div className='space-y-3 pr-4'>
            {timeline.map((turn, idx) => (
              <div key={idx} className='flex items-center gap-4 bg-gray-900 p-3 rounded border border-gray-700 hover:border-blue-700 transition-colors'>
                <div className='text-center min-w-[60px]'>
                  <p className='text-xs text-gray-400'>Turn</p>
                  <p className='text-lg font-bold'>{idx + 1}</p>
                  <p className='text-xs text-gray-500'>R{turn.round}</p>
                </div>
                
                <div className='flex-1'>
                  <div className='flex justify-between items-center mb-2'>
                    <p className='font-bold text-lg text-blue-400'>{turn.player}</p>
                    <div className='text-right'>
                      <p className='text-sm text-gray-400'>Scored</p>
                      <p className='text-xl font-bold text-green-400'>+{turn.pointsScored}</p>
                    </div>
                  </div>
                  
                  <div className='flex gap-2 items-center'>
                    <div className='flex gap-1 flex-1'>
                      {turn.throws.map((throwValue, throwIdx) => (
                        <div key={throwIdx} className='bg-gray-800 px-3 py-2 rounded flex-1 text-center'>
                          <p className='font-bold text-lg'>
                            {throwValue !== null && throwValue !== undefined ? throwValue : '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className='text-center bg-blue-900/30 px-3 py-2 rounded min-w-[80px]'>
                      <p className='text-xs text-gray-400'>Points Left</p>
                      <p className='font-bold text-lg'>{turn.pointsAfter}</p>
                    </div>
                    
                    <div className='text-center bg-purple-900/30 px-3 py-2 rounded min-w-[70px]'>
                      <p className='text-xs text-gray-400'>Avg</p>
                      <p className='font-bold'>{turn.avg}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default GameTimeline;
