import Esp32ComboBox from '@/components/Home/Esp32/Esp32ComboBox';
import Loading from '@/components/Home/Loading';
import { Slider } from '@/components/ui/shadcn/slider';
import { Switch } from '@/components/ui/shadcn/switch';
import { AuthContext } from '@/context/Home/AuthContext';
import { getESP32Effects, getESP32Info, getESP32State, patchESP32State } from '@/lib/fetch';
import { Power, Sparkles, Sun } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { RgbaColorPicker } from 'react-colorful';

function Esp32WLedDarts(props) {
  const { refreshingData, setRefreshingData } = props;

  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const [ESP32State, setESP32State] = useState(null);
  const [ESP32Info, setESP32Info] = useState(null);
  const [ESP32Effects, setESP32Effects] = useState(null);

  const [sliderValue, setSliderValue] = useState(0);
  const [colorValue, setColorValue] = useState({ r: 255, g: 255, b: 255, a: 1 });

  const handleESP32StateChange = async (change, value) => {
    try {
      if (change === "on") {
        const response = await patchESP32State({ on: "toggle", role: currentUser.role });
        setESP32State((prev) => ({ ...prev, on: response.on }));
      } else if (change === "bri") {
        const response = await patchESP32State({ bri: value, role: currentUser.role });
        setESP32State((prev) => ({ ...prev, bri: response.bri }));
      } else if (change === "color") {
        let { r, g, b, a } = value;
        r *= a;
        g *= a;
        b *= a;
        await patchESP32State({ color: { r, g, b }, role: currentUser.role });
        setESP32State((prev) => ({ ...prev, seg: [{ col: [[r, g, b]] }] }));
      } else if (change === "effect") {
        const foundEffect = ESP32Effects.findIndex((eff) => value === eff);

        await patchESP32State({
          effect: {
            fx: foundEffect,
            sx: 128,
            ix: 128,
            pal: 0
          },
          role: currentUser.role
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleWLEDState = async () => {
    try {
      const response = await getESP32State();
      if (response.message) throw new Error(response.message);

      const responseColors = {
        r: response.seg[0].col[0][0],
        g: response.seg[0].col[0][1],
        b: response.seg[0].col[0][2]
      }
      setColorValue({ ...responseColors, a: 1 });

      setSliderValue(response.bri);
      setESP32State(response);
    } catch (err) {
      setESP32State(err);
      console.error(err);
    }
  }

  const handleWLEDInfo = async () => {
    try {
      const response = await getESP32Info();

      setESP32Info(response);
    } catch (err) {
      console.error(err);
    }
  }

  const handleWLEDEffects = async () => {
    try {
      const response = await getESP32Effects();

      setESP32Effects(response);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await handleWLEDState();
        await handleWLEDInfo();
        await handleWLEDEffects();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshingData(false);
      }
    };

    if (refreshingData === true || ESP32State === null) {
      fetchData();
    }
  }, [refreshingData]);

  return (
    <div className="esp32-page flex flex-col items-center gap-10">
      {loading ? (
        <Loading />
      ) : (
        ESP32State?.message === "fetch failed" ? (
          <span className='text-2xl text-red-500'>ESP32 WLED connection failed.</span>
        ) : (
          <div className='flex w-full flex-col md:flex-row gap-20 md:gap-0'>
            <div className='flex flex-col gap-20 md:px-20 flex-wrap w-full md:w-1/2 justify-center'>
              <div className='flex flex-wrap justify-center gap-20'>
                <div className='h-[100px] flex flex-col items-center justify-between'>
                  <Power size={50} />
                  <Switch
                    checked={ESP32State.on}
                    onCheckedChange={() => handleESP32StateChange("on")}
                  />
                </div>
                <div className={`h-[100px] flex flex-col w-[157px] items-center justify-between ${!ESP32State.on && "opacity-50"}`}>
                  <Sun size={50} />
                  <div className='flex justify-between w-full'>
                    <Slider
                      defaultValue={[ESP32State.bri]}
                      min={1}
                      max={255}
                      step={1}
                      className={`w-[120px] p-2 `}
                      onValueCommit={(value) => handleESP32StateChange("bri", value[0])}
                      onValueChange={(value) => setSliderValue(value[0])}
                      disabled={!ESP32State.on}
                    />
                    <span>{sliderValue}</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap justify-center gap-20'>
                <div className='h-[110px] flex flex-col items-center justify-between'>
                  <Sparkles size={50} />
                  <Esp32ComboBox
                    data={ESP32Effects}
                    defaultValue={ESP32State.seg[0].fx}
                    handleESP32StateChange={handleESP32StateChange}
                    type="effect"
                    refreshingData={refreshingData}
                  />
                </div>
              </div>

              <div className='flex justify-center'>
                <RgbaColorPicker
                  color={colorValue}
                  onChange={setColorValue}
                  onMouseUp={() => handleESP32StateChange("color", colorValue)}
                  disabled
                />
              </div>
            </div>

            <div className='flex flex-col gap-10 items-center md:border-l-2 w-full md:w-1/2 md:px-20'>
              <span className='text-4xl text-center'>
                INFO - <a className='text-blue-500 hover:underline' target="_blank" href={`http://${ESP32Info.ip}`}>Dashboard</a>
              </span>

              <div className='flex gap-10 flex-wrap justify-center'>
                <div className='h-[100px] flex flex-col items-center justify-between'>
                  <span className='text-3xl'>MAC</span>
                  <span className='text-xl'>{ESP32Info.mac}</span>
                </div>
                <div className='h-[100px] flex flex-col items-center justify-between'>
                  <span className='text-3xl'>IP</span>
                  <span className='text-xl'>{ESP32Info.ip}</span>
                </div>
                <div className='h-[100px] flex flex-col items-center justify-between'>
                  <span className='text-3xl'>Uptime</span>
                  <span className='text-xl'>{new Date(ESP32Info.uptime * 1000).toISOString().slice(11, 19)}</span>
                </div>
              </div>

              <div className='flex flex-col items-center gap-10 w-full'>
                <span className='text-4xl'>WIFI</span>

                <div className='flex gap-10 flex-wrap justify-center'>
                  <div className='h-[100px] flex flex-col items-center justify-between'>
                    <span className='text-3xl'>BSSID</span>
                    <span className='text-xl'>{ESP32Info.wifi.bssid}</span>
                  </div>
                  <div className='h-[100px] flex flex-col items-center justify-between'>
                    <span className='text-3xl'>RSSI</span>
                    <span className='text-xl'>{ESP32Info.wifi.rssi} dBm</span>
                  </div>
                  <div className='h-[100px] flex flex-col items-center justify-between'>
                    <span className='text-3xl'>Signal</span>
                    <span className='text-xl'>{ESP32Info.wifi.signal} %</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div >
  )
}

export default Esp32WLedDarts;