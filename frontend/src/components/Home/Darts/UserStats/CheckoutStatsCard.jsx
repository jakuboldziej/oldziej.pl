import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';

function CheckoutStatsCard({ analytics, dartUser }) {
  if (!analytics || analytics.checkoutStats.totalCheckouts === 0) {
    return null;
  }

  return (
    <Card className='bg-gray-800 border-gray-700 mb-8'>
      <CardHeader>
        <CardTitle className='text-lg'>Checkout Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Total Checkouts</p>
            <p className='text-3xl font-bold text-green-400'>{analytics.checkoutStats.totalCheckouts}</p>
          </div>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Average Checkout</p>
            <p className='text-3xl font-bold'>{analytics.checkoutStats.avgCheckout}</p>
          </div>
          <div className='text-center bg-gray-900 p-4 rounded'>
            <p className='text-gray-400 text-sm mb-2'>Highest Checkout</p>
            <p className='text-3xl font-bold text-yellow-400'>{dartUser.highestCheckout}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CheckoutStatsCard;
