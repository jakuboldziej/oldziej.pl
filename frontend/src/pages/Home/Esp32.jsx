import Loading from '@/components/Home/Loading';
import { Label } from '@/components/ui/shadcn/label'
import { Switch } from '@/components/ui/shadcn/switch'
import { socket } from '@/lib/socketio'
import React, { useEffect, useState } from 'react'

function Esp32() {
  return (
    <div className="esp32-page flex justify-center">
      <span className="text-2xl">WLED</span>
    </div>
  )
}

export default Esp32