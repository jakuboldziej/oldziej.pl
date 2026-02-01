import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

function HeadToHeadComparison({ comparison, isActive }) {
  if (!comparison || !isActive) return null;

  return (
    <Card className='bg-gray-800 border-gray-700 mb-8'>
      <CardHeader>
        <CardTitle>Head-to-Head Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <p className='text-gray-400 text-sm mb-2'>Points Leader</p>
            <p className='text-2xl font-bold text-blue-400'>{comparison.leader}</p>
            <p className='text-gray-400'>+{comparison.pointsAdvantage} points</p>
          </div>
          <div className='text-center'>
            <p className='text-gray-400 text-sm mb-2'>Average Leader</p>
            <p className='text-2xl font-bold text-green-400'>{comparison.avgLeader}</p>
            <p className='text-gray-400'>+{comparison.avgAdvantage} avg</p>
          </div>
          <div className='text-center'>
            <p className='text-gray-400 text-sm mb-2'>Total Darts Thrown</p>
            <div className='flex justify-center gap-4 mt-2'>
              {Object.entries(comparison.throwsCompare).map(([name, throws]) => (
                <div key={name}>
                  <p className='font-bold'>{throws}</p>
                  <p className='text-xs text-gray-400'>{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HeadToHeadComparison;
