import { Label } from '@/components/ui/shadcn/label'
import { Switch } from '@/components/ui/shadcn/switch'
import { socket } from '@/lib/socketio'
import React, { useEffect, useState } from 'react'

function Esp32() {
  const [switchStatus, setSwitchStatus] = useState(false);
  const [LEDStatus, setLEDStatus] = useState(null);

  const handleLEDSwitch = (action) => {
    socket.emit("ESP32_CONTROL_LED_SERVER", action);
  }

  const checkLEDStatus = () => {
    socket.emit("ESP32_CHECK_LED_SERVER")
  }

  useEffect(() => {
    checkLEDStatus();
  }, []);

  useEffect(() => {
    setSwitchStatus(LEDStatus === "on" ? true : false);
  }, [LEDStatus]);

  useEffect(() => {
    if (!LEDStatus) return;

    if (switchStatus === false && LEDStatus === 'off') return;
    console.log(switchStatus, LEDStatus)
    handleLEDSwitch(switchStatus);
  }, [switchStatus, LEDStatus]);

  useEffect(() => {
    const esp32_led_status = (data) => {
      setLEDStatus(data);
    }

    socket.on('ESP32_LED_STATUS', esp32_led_status);


    return () => {
      socket.off('ESP32_LED_STATUS', esp32_led_status);
    };
  }, []);

  return (
    <div className="esp32-page text-white w-full container_no_nav flex flex-col gap-10 items-center justify-center">
      <span className="text-2xl">Control ESP-32</span>
      <div className='flex items-center gap-4'>
        <Switch id="switch" checked={switchStatus} onCheckedChange={setSwitchStatus} />
        <Label htmlFor='switch' className='text-xl'>LED {switchStatus ? 'ON' : 'OFF'}</Label>
      </div>
    </div>
  )
}

export default Esp32