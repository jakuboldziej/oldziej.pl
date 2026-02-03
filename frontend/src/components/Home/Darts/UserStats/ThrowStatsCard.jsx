import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import MyTooltip from '@/components/Home/MyComponents/MyTooltip';

function ThrowStatsCard({ dartUser, calculateTotalThrows }) {
  return (
    <Card className='bg-gray-800 border-gray-700 mb-8'>
      <CardHeader>
        <CardTitle>Throw Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Normal</p>
            <p className='text-3xl font-bold'>{dartUser.throws.normal.toLocaleString()}</p>
            <p className='text-xs text-gray-500 mt-1'>
              {((dartUser.throws.normal / calculateTotalThrows()) * 100).toFixed(1)}%
            </p>
          </div>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Doubles</p>
            <p className='text-3xl font-bold text-blue-400'>{dartUser.throws.doubles.toLocaleString()}</p>
            <p className='text-xs text-gray-500 mt-1'>
              {((dartUser.throws.doubles / calculateTotalThrows()) * 100).toFixed(1)}%
            </p>
          </div>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Triples</p>
            <p className='text-3xl font-bold text-green-400'>{dartUser.throws.triples.toLocaleString()}</p>
            <p className='text-xs text-gray-500 mt-1'>
              {((dartUser.throws.triples / calculateTotalThrows()) * 100).toFixed(1)}%
            </p>
          </div>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <MyTooltip title="Door Hits">
              <div>
                <div className='flex items-center justify-center gap-1 mb-2'>
                  <img width="20" height="20" src="https://img.icons8.com/officel/20/door.png" alt="door" />
                  <p className='text-gray-400 text-sm'>Doors</p>
                </div>
                <p className='text-3xl font-bold text-green'>{dartUser.throws.doors.toLocaleString()}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  {((dartUser.throws.doors / calculateTotalThrows()) * 100).toFixed(1)}%
                </p>
              </div>
            </MyTooltip>
          </div>
          {dartUser.throws.overthrows !== undefined && (
            <div className='text-center bg-gray-900 p-4 rounded'>
              <p className='text-gray-400 text-sm mb-2'>Overthrows</p>
              <p className='text-3xl font-bold text-red-400'>{dartUser.throws.overthrows.toLocaleString()}</p>
              <p className='text-xs text-gray-500 mt-1'>
                {((dartUser.throws.overthrows / calculateTotalThrows()) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
        <div className='mt-4 text-center'>
          <p className='text-gray-400'>Total Darts Thrown</p>
          <p className='text-2xl font-bold'>{calculateTotalThrows().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ThrowStatsCard;
