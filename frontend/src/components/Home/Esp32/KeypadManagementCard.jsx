import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';

function KeypadManagementCard({ onKeypadPress }) {
  const [lastPressed, setLastPressed] = useState(null);

  const handleKeyClick = (key) => {
    setLastPressed(key);

    setTimeout(() => {
      setLastPressed(null);
    }, 300);

    if (onKeypadPress) {
      onKeypadPress(key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      const target = event.target;

      if (target.tagName === 'INPUT') return;

      if (/^[0-9*#]$/.test(key)) {
        handleKeyClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='flex flex-col items-center gap-10 w-full'>
      <span className='text-4xl'>Keypad</span>

      <div className='w-[280px] max-w-full'>
        <div className='flex flex-col gap-4'>
          <div className='grid grid-cols-3 gap-2'>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '1' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('1')}
            >
              1
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '2' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('2')}
            >
              2
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '3' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('3')}
            >
              3
            </Button>

            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '4' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('4')}
            >
              4
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '5' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('5')}
            >
              5
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '6' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('6')}
            >
              6
            </Button>

            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '7' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('7')}
            >
              7
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '8' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('8')}
            >
              8
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '9' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('9')}
            >
              9
            </Button>

            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold text-yellow-500 ${lastPressed === '*' ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}
              onClick={() => handleKeyClick('*')}
            >
              *
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold ${lastPressed === '0' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              onClick={() => handleKeyClick('0')}
            >
              0
            </Button>
            <Button
              variant="outline"
              className={`h-14 text-2xl font-bold text-green-500 ${lastPressed === '#' ? 'bg-green-100 dark:bg-green-900' : ''}`}
              onClick={() => handleKeyClick('#')}
            >
              #
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeypadManagementCard;
