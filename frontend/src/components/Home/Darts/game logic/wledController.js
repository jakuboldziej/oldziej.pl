import { getESP32State, patchESP32State } from "@/lib/fetch"

export const handleWLEDEffectSolid = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      color: { r: 255, g: 255, b: 255 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    await patchESP32State(data);
  } catch (err) {
    console.error(err);
  }
}

export const handleWLEDGameEnd = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      color: { r: 255, g: 215, b: 0 },
      effect: {
        fx: 156,
        sx: 128,
        ix: 128,
        pal: 0
      }
    };

    await patchESP32State(data);

    setTimeout(async () => {
      const data = {
        color: { r: 255, g: 215, b: 0 },
        effect: {
          fx: 156,
          sx: 128,
          ix: 128,
          pal: 0
        }
      };

      await patchESP32State(data);
    }, 1000);
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

    await patchESP32State(data);

    setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1500);
  } catch (err) {
    console.error(err);
  }
}

export const handleWLEDThrowT20 = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      effect: {
        fx: 9,
        sx: 128,
        ix: 128,
        pal: 0
      }
    };

    await patchESP32State(data);

    setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1000);
  } catch (err) {
    console.error(err);
  }
}

export const handleWLEDOverthrow = async () => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      color: { r: 255, g: 0, b: 0 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    await patchESP32State(data);

    setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1000);
  } catch (err) {
    console.error(err);
  }
}