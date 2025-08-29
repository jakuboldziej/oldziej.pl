import React from 'react';

function DoorInfoCard({ doorState, isValidationNeeded }) {
  return (
    <div className='flex flex-col items-center gap-10 w-full'>
      <span className='text-4xl'>Door</span>

      <div className='flex gap-10 flex-wrap justify-center'>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <span className='text-3xl'>Door opened?</span>
          <span className='text-xl'>{doorState === true ? "Yes" : "No"}</span>
        </div>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <span className='text-3xl'>Verification?</span>
          <span className='text-xl'>{isValidationNeeded === true ? "Yes" : "No"}</span>
        </div>
      </div>
    </div>
  );
}

export default DoorInfoCard;
