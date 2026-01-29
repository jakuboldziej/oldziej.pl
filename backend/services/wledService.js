const fetch = require('node-fetch');

const wledDomain = process.env.WLED_DOMAIN;

let timeoutId = null;

const getWLEDstate = async () => {
  try {
    const response = await fetch(`${wledDomain}/json/state`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    return await response.json();
  } catch (err) {
    console.error('Error getting WLED state:', err);
    return { on: false };
  }
};

const changeWLEDstate = async (data) => {
  try {
    const WLEDState = await getWLEDstate();
    if (WLEDState.on === false) return;

    const body = {
      on: true,
      bri: 255,
      transition: 7,
      ...(data.color && { seg: [{ col: [[data.color.r, data.color.g, data.color.b]] }] }),
      ...(data.effect && { seg: [{ fx: data.effect.fx, sx: data.effect.sx, ix: data.effect.ix, pal: data.effect.pal }] })
    };

    await fetch(`${wledDomain}/json/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Error changing WLED state:', err);
  }
};

const handleWLEDEffectSolid = async () => {
  try {
    if (timeoutId) clearTimeout(timeoutId);

    const data = {
      color: { r: 255, g: 255, b: 255 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDGameEnd = async () => {
  try {
    const data = {
      color: { r: 255, g: 215, b: 0 },
      effect: {
        fx: 156,
        sx: 128,
        ix: 128,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await changeWLEDstate(data);
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowDoors = async () => {
  try {
    const data = {
      color: { r: 0, g: 255, b: 0 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowT20 = async () => {
  try {
    const data = {
      effect: {
        fx: 9,
        sx: 128,
        ix: 128,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowD25 = async () => {
  try {
    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 3000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrow180 = async () => {
  try {
    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 10000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDOverthrow = async () => {
  try {
    const data = {
      color: { r: 255, g: 0, b: 0 },
      effect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid();
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};

// Initialize WLED socket listeners
const initializeWLEDListeners = (io) => {
  io.on('connection', (socket) => {
    socket.on('wled:effect-solid', async (data) => {
      await handleWLEDEffectSolid();
    });

    socket.on('wled:game-end', async (data) => {
      await handleWLEDGameEnd();
    });

    socket.on('wled:throw-doors', async (data) => {
      await handleWLEDThrowDoors();
    });

    socket.on('wled:throw-t20', async (data) => {
      await handleWLEDThrowT20();
    });

    socket.on('wled:throw-d25', async (data) => {
      await handleWLEDThrowD25();
    });

    socket.on('wled:throw-180', async (data) => {
      await handleWLEDThrow180();
    });

    socket.on('wled:overthrow', async (data) => {
      await handleWLEDOverthrow();
    });
  });
};

module.exports = {
  initializeWLEDListeners
};
