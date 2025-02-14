import { getESP32State, patchESP32State } from "@/lib/fetch"

export const handleWLEDEffectSolid = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      seg: {
        fx: 0,
        col: [[255, 255, 255]],
      },
    };

    await patchESP32State(data);
  } catch (err) {
    console.error(err);
  }
}

export const handleWLEDThrowDoors = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      color: { r: 0, g: 255, b: 0 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    const response = await patchESP32State(data);
    console.log(response)
  } catch (err) {
    console.error(err);
  }
}