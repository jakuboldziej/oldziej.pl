import { getESP32State, patchESP32State } from "@/lib/fetch";

let timeoutId = null;

export const handleWLEDEffectSolid = async (gameCode) => {
  try {
    if (timeoutId) clearTimeout(timeoutId);

    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      color: { r: 255, g: 255, b: 255 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      },
      gameCode
    };

    await patchESP32State(data);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDGameEnd = async (gameCode) => {
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
      },
      gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const data = {
        color: { r: 255, g: 215, b: 0 },
        effect: {
          fx: 156,
          sx: 128,
          ix: 128,
          pal: 0
        },
        gameCode
      };

      await patchESP32State(data);
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDThrowDoors = async (gameCode) => {
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
      },
      gameCode: gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDThrowT20 = async (gameCode) => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      effect: {
        fx: 9,
        sx: 128,
        ix: 128,
        pal: 0
      },
      gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDThrowD25 = async (gameCode) => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      },
      gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 10000);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDThrow180 = async (gameCode) => {
  try {
    const WLEDState = await getESP32State();
    if (WLEDState.on === false) return;

    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      },
      gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 10000);
  } catch (err) {
    console.error(err);
  }
};

export const handleWLEDOverthrow = async (gameCode) => {
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
      },
      gameCode
    };

    await patchESP32State(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};