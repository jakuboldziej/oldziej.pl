import Loading from '@/components/Home/Loading';
import { Label } from '@/components/ui/shadcn/label'
import { Slider } from '@/components/ui/shadcn/slider';
import { Switch } from '@/components/ui/shadcn/switch'
import { getESP32State, patchESP32State } from '@/lib/fetch';
import { Power, Sun } from 'lucide-react';
import { useEffect, useState } from 'react'

function Esp32(props) {
  const { refreshingData, setRefreshingData } = props;

  const [ESPState, setESPState] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleESP32StateChange = async (change, value) => {
    try {
      if (change === "on") {
        const response = await patchESP32State({ on: "toggle" });
        setESPState((prev) => ({ ...prev, on: response.on }));
      }
      else if (change === "bri") {
        const response = await patchESP32State({ bri: value });
        setESPState((prev) => ({ ...prev, bri: response.bri }))
      }
    } catch (err) {
      console.error(err);
    }
  }

  const checkWLEDState = async () => {
    setLoading(true);
    try {
      const response = await getESP32State();
      console.log(response);
      setESPState(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (refreshingData === true || ESPState === null) {
      checkWLEDState();
      setRefreshingData(false);
    }
  }, [refreshingData, ESPState]);

  return (
    <div className="esp32-page flex flex-col items-center gap-10">
      <span className="text-4xl">WLED</span>
      {loading ? (
        <Loading />
      ) : (
        ESPState.message === "fetch failed" ? (
          <span className='text-2xl text-red-500'>ESP32 WLED connection failed.</span>
        ) : (
          <div className='flex gap-20'>
            <div className='flex flex-col h-[100px] items-center justify-between'>
              <Power size={50} />
              <Switch
                checked={ESPState.on}
                onCheckedChange={() => handleESP32StateChange("on")}
              />
            </div>

            <div className='flex flex-col h-[100px] items-center justify-between'>
              <Sun size={50} />
              <Slider
                defaultValue={[ESPState.bri]}
                min={1}
                max={255}
                step={1}
                className={`w-[120px] p-2 ${!ESPState.on && "opacity-50"}`}
                onValueCommit={(value) => handleESP32StateChange("bri", value[0])}
                disabled={!ESPState.on}
              />
            </div>
          </div>
        )
      )}
    </div >
  )
}

export default Esp32