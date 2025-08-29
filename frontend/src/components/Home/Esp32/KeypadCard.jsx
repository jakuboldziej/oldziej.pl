import React from 'react';

function KeypadCard({ keypadStrokes, validationResult }) {
  return (
    <div className='flex flex-col items-center gap-10 w-full'>
      <span className='text-4xl'>Keypad</span>

      <div className='flex flex-col gap-6 w-full max-w-[280px] items-center'>
        <div className='flex flex-col items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-md'>
          <span className='text-xl mb-2'>Current Input</span>
          <span className='text-2xl font-mono'>{keypadStrokes || "None"}</span>
        </div>

        {validationResult && (
          <div className={`flex flex-col items-center justify-center w-full p-4 rounded-md ${validationResult.success
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
            <span className='text-xl font-semibold'>
              {validationResult.success ? 'Success!' : 'Failed!'}
            </span>
            <span className='text-sm mt-1'>{validationResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KeypadCard;
