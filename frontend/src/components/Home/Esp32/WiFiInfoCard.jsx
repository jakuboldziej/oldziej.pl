import React from 'react';

function WiFiInfoCard({ ESP32Info }) {
  if (!ESP32Info) return null;

  return (
    <div className='flex flex-col items-center gap-10 w-full'>
      <span className='text-4xl'>WIFI</span>

      <div className='flex gap-10 flex-wrap justify-center'>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <span className='text-3xl'>IP</span>
          <span className='text-xl'>{ESP32Info.ip}</span>
        </div>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <span className='text-3xl'>RSSI</span>
          <span className='text-xl'>{ESP32Info.rssi} dBm</span>
        </div>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <span className='text-3xl'>Signal</span>
          <span className='text-xl'>{ESP32Info.signal} %</span>
        </div>
      </div>
    </div>
  );
}

export default WiFiInfoCard;
