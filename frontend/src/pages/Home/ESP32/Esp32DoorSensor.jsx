import Loading from '@/components/Home/Loading';
import { Input } from '@/components/ui/shadcn/input';
import { Switch } from '@/components/ui/shadcn/switch';
import { checkIfValidationNeeded, getValidationConfig, postValidationActive } from '@/lib/fetch';
import { socket } from '@/lib/socketio';
import { Clock, Power } from 'lucide-react';
import { useEffect, useState } from 'react';

function Esp32DoorSensor(props) {
  const { refreshingData, setRefreshingData } = props;

  const [loading, setLoading] = useState(true);
  const [ESP32State, setESP32State] = useState(null);
  const [ESP32Info, setESP32Info] = useState(null);

  const updateESP32State = (key, value) => {
    setESP32State((prev) => ({ ...prev, [key]: value }));
  }

  const updateESP32WifiConnection = async (data) => {
    try {
      setESP32Info(data);
    } catch (err) {
      setESP32Info(err);
      console.error(err);
    }
  };

  const updateESP32DoorState = async (doorsState) => {
    try {
      updateESP32State("doorsState", doorsState === 1);
    } catch (err) {
      console.error(err);
    }
  };

  const updateESP32ValidationState = async (validationState) => {
    updateESP32State("isValidationNeeded", validationState);
  };

  const updateESP32ValidationActive = async () => {
    try {
      const response = await postValidationActive(!ESP32State.validationConfig.isValidationActive);

      if (!response || response.success === false) throw new Error("Updating validation active failed");

      updateESP32State("validationConfig", {
        ...ESP32State.validationConfig,
        isValidationActive: response.isValidationActive
      });
    } catch (err) {
      console.error(err);
    }
  };

  const checkESP32ValidationState = async () => {
    try {
      const isValidationNeededResp = await checkIfValidationNeeded();
      updateESP32State("isValidationNeeded", isValidationNeededResp);
    } catch (err) {
      console.error(err);
    }
  };

  const handleESP32ValidationConfig = async () => {
    try {
      const validationConfigResp = await getValidationConfig();
      updateESP32State("validationConfig", validationConfigResp);
    } catch (err) {
      console.error(err);
    }
  };

  const checkESP32WifiConnection = async () => {
    try {
      socket.emit("esp32-door:check-wifi-connection");
    } catch (err) {
      console.error(err);
    }
  };

  const checkESP32DoorState = async () => {
    try {
      socket.emit("esp32:checkDoorsState", { requester: socket.id });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        await checkESP32WifiConnection();
        await checkESP32DoorState();
        await checkESP32ValidationState();
        await handleESP32ValidationConfig();
        await new Promise(resolve => setTimeout(resolve, 500));
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

  useEffect(() => {
    socket.on("esp32:connection-info", updateESP32WifiConnection)
    socket.on('esp32:door-state-changed', updateESP32DoorState);
    socket.on('esp32:doorState-response', updateESP32DoorState);
    socket.on('esp32:validation-state-changed', updateESP32ValidationState);

    return () => {
      socket.off("esp32:connection-info", updateESP32WifiConnection)
      socket.off("esp32:door-state-changed", updateESP32DoorState)
      socket.off("esp32:doorState-response", updateESP32DoorState)
      socket.off("esp32:validation-state-changed", updateESP32ValidationState)
    }
  }, []);

  return (
    <div className="esp32-page flex flex-col items-center gap-10">
      {loading ? (
        <Loading />
      ) : (
        !ESP32State || !ESP32Info || ESP32State?.message === "fetch failed" ? (
          <span className='text-2xl text-red-500'>ESP32 WLED connection failed.</span>
        ) : (
          <div className='flex w-full flex-col md:flex-row gap-20 md:gap-0'>
            <div className='flex flex-col gap-10 items-center w-full md:w-1/2 md:px-20'>
              <span className='text-4xl text-center'>
                MANAGE
              </span>

              <div className='flex flex-wrap justify-center gap-20'>
                <div className='h-[100px] flex flex-col items-center justify-between'>
                  <Power size={50} />
                  <Switch
                    checked={ESP32State.validationConfig.isValidationActive}
                    onCheckedChange={() => updateESP32ValidationActive()}
                  />
                </div>
                <div className='flex flex-col items-center justify-between gap-6'>
                  <Clock size={50} />
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-sm">Start hour</label>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        step={1}
                        value={ESP32State?.validationConfig?.validationStartHour ?? ''}
                        onChange={e =>
                          updateESP32State("validationConfig", {
                            ...ESP32State.validationConfig,
                            startHour: Math.max(0, Math.min(23, Number(e.target.value)))
                          })
                        }
                        className="border rounded px-2 py-1 text-center"
                        placeholder="0-23"
                      />
                    </div>
                    <div>
                      <label className="text-sm">End hour</label>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        step={1}
                        value={ESP32State?.validationConfig?.validationEndHour ?? ''}
                        onChange={e =>
                          updateESP32State("validationConfig", {
                            ...ESP32State.validationConfig,
                            endHour: Math.max(0, Math.min(23, Number(e.target.value)))
                          })
                        }
                        className="border rounded px-2 py-1 text-center"
                        placeholder="0-23"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className='flex flex-col gap-10 items-center md:border-l-2 w-full md:w-1/2 md:px-20'>
              <span className='text-4xl text-center'>
                INFO
              </span>

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

              <div className='flex flex-col items-center gap-10 w-full'>
                <span className='text-4xl'>Door</span>

                <div className='flex gap-10 flex-wrap justify-center'>
                  <div className='h-[100px] flex flex-col items-center justify-between'>
                    <span className='text-3xl'>Door opened?</span>
                    <span className='text-xl'>{ESP32State.doorsState === true ? "Yes" : "No"}</span>
                  </div>
                  <div className='h-[100px] flex flex-col items-center justify-between'>
                    <span className='text-3xl'>Verification?</span>
                    <span className='text-xl'>{ESP32State.isValidationNeeded === true ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default Esp32DoorSensor;