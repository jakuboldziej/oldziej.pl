import { useEffect, useState } from 'react';
import { socket } from '@/lib/socketio';
import { checkIfValidationNeeded, getValidationConfig, postValidationActive, patchValidationConfig, getKeypadStrokes, postKeypadStroke } from '@/lib/fetch';
import Loading from '@/components/Home/Loading';
import WiFiInfoCard from '@/components/Home/Esp32/WiFiInfoCard';
import DoorManagementCard from '@/components/Home/Esp32/DoorManagementCard';
import DoorInfoCard from '@/components/Home/Esp32/DoorInfoCard';
import KeypadCard from '@/components/Home/Esp32/KeypadCard';
import KeypadManagementCard from '@/components/Home/Esp32/KeypadManagementCard';

function Esp32DoorSensor(props) {
  const { refreshingData, setRefreshingData } = props;

  const [loading, setLoading] = useState(true);
  const [ESP32State, setESP32State] = useState(null);
  const [ESP32Info, setESP32Info] = useState(null);
  const [keypadStrokes, setKeypadStrokes] = useState("");
  const [inputKeypadStokes, setInputKeypadStokes] = useState("");
  const [validationResult, setValidationResult] = useState(null);

  const updateESP32State = (key, value) => {
    setESP32State((prev) => ({ ...prev, [key]: value }));
  };

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

  const updateValidationConfig = async (newConfig) => {
    try {
      const response = await patchValidationConfig(newConfig);

      if (!response) {
        throw new Error("Updating validation configuration failed");
      }

      updateESP32State("validationConfig", response);
    } catch (error) {
      console.error(error);
      await handleESP32ValidationConfig();
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

  // Keypad

  const handleGetESP32KeypadStrokes = async () => {
    try {
      const keypadStrokesResp = await getKeypadStrokes();
      setKeypadStrokes(keypadStrokesResp);
    } catch (err) {
      console.error(err);
    }
  };

  const updateESP32KeypadStrokes = (keyStroke) => {
    const enterButton = "#";
    const resetButton = "*";
    const ABCD = "ABCD";

    if (validationResult) {
      setValidationResult(null);
    }

    if (keyStroke === enterButton) {
      setKeypadStrokes("");
    } else if (keyStroke === resetButton) {
      setKeypadStrokes("");
    } else if (!ABCD.includes(keyStroke)) {
      setKeypadStrokes((prevCode) => prevCode += keyStroke);
    }
  };

  const handleValidationResult = (result) => {
    setValidationResult(result);

    setTimeout(() => {
      setValidationResult(null);
    }, 5000);
  };

  const handleKeypadPress = async (keyStroke) => {
    try {
      await postKeypadStroke(keyStroke);
    } catch (error) {
      console.error(error);
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
        await handleGetESP32KeypadStrokes();
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
    socket.on("esp32:door-state-changed", updateESP32DoorState);
    socket.on("esp32:doorState-response", updateESP32DoorState);
    socket.on("esp32:validation-state-changed", updateESP32ValidationState);
    socket.on("esp32:keypad-stroke", updateESP32KeypadStrokes);
    socket.on("esp32:keypad-validation-result", handleValidationResult);

    return () => {
      socket.off("esp32:connection-info", updateESP32WifiConnection)
      socket.off("esp32:door-state-changed", updateESP32DoorState)
      socket.off("esp32:doorState-response", updateESP32DoorState)
      socket.off("esp32:validation-state-changed", updateESP32ValidationState)
      socket.off("esp32:keypad-stroke", updateESP32KeypadStrokes)
      socket.off("esp32:keypad-validation-result", handleValidationResult)
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
          <div className='flex w-full flex-col md:flex-row gap-20 md:gap-0 pb-20'>
            <div className='flex flex-col gap-10 items-center w-full md:w-1/2 md:px-20'>
              <span className='text-4xl text-center'>MANAGE</span>

              <DoorManagementCard
                validationConfig={ESP32State.validationConfig}
                onValidationActiveChange={updateESP32ValidationActive}
                onConfigChange={updateValidationConfig}
              />

              <KeypadManagementCard
                onKeypadPress={handleKeypadPress}
              />
            </div>

            <div className='flex flex-col gap-10 items-center md:border-l-2 w-full md:w-1/2 md:px-20'>
              <span className='text-4xl text-center'>INFO</span>

              <WiFiInfoCard ESP32Info={ESP32Info} />

              <DoorInfoCard
                doorState={ESP32State.doorsState}
                isValidationNeeded={ESP32State.isValidationNeeded}
              />

              <KeypadCard
                keypadStrokes={keypadStrokes}
                validationResult={validationResult}
              />
            </div>
          </div>
        ))}
    </div>
  )
}

export default Esp32DoorSensor;