import Loading from '@/components/Home/Loading';
import { Slider } from '@/components/ui/shadcn/slider';
import { Switch } from '@/components/ui/shadcn/switch';
import { getESP32State, patchESP32State } from '@/lib/fetch';
import { Power, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';

function Esp32(props) {
  const { refreshingData, setRefreshingData } = props;

  const [ESPState, setESPState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [colorValue, setColorValue] = useState({ r: 255, g: 255, b: 255, a: 1 });

  const handleESP32StateChange = async (change, value) => {
    try {
      if (change === "on") {
        const response = await patchESP32State({ on: "toggle" });
        setESPState((prev) => ({ ...prev, on: response.on }));
      } else if (change === "bri") {
        const response = await patchESP32State({ bri: value });
        setESPState((prev) => ({ ...prev, bri: response.bri }));
      } else if (change === "color") {
        let { r, g, b, a } = value;
        r *= a;
        g *= a;
        b *= a;
        await patchESP32State({ color: { r, g, b } });
        setESPState((prev) => ({ ...prev, seg: [{ col: [[r, g, b]] }] }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const checkWLEDState = async () => {
    setLoading(true);
    try {
      const response = await getESP32State();

      const responseColors = {
        r: response.seg[0].col[0][0],
        g: response.seg[0].col[0][1],
        b: response.seg[0].col[0][2]
      }
      setColorValue({ ...responseColors, a: 1 });

      setSliderValue(response.bri);
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
      <span className="text-4xl flex gap-4 items-center">WLED</span>
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

            <div className={`flex flex-col h-[100px] w-[157px] items-center justify-between ${!ESPState.on && "opacity-50"}`}>
              <Sun size={50} />
              <div className='flex justify-between w-full'>
                <Slider
                  defaultValue={[ESPState.bri]}
                  min={1}
                  max={255}
                  step={1}
                  className={`w-[120px] p-2 `}
                  onValueCommit={(value) => handleESP32StateChange("bri", value[0])}
                  onValueChange={(value) => setSliderValue(value[0])}
                  disabled={!ESPState.on}
                />
                <span>{sliderValue}</span>
              </div>
            </div>
            <div>
              <RgbaColorPicker
                color={colorValue}
                onChange={setColorValue}
                onMouseUp={() => handleESP32StateChange("color", colorValue)}
              />
            </div>
          </div>
        )
      )
      }
    </div >
  )
}

export default Esp32