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

let getWledGameCode = null;

const setWledGameCodeGetter = (getter) => {
  getWledGameCode = getter;
};

const changeWLEDstate = async (data, gameCode = null) => {
  try {
    if (gameCode && getWledGameCode) {
      const activeGame = getWledGameCode();
      if (!activeGame.code || activeGame.code !== gameCode) {
        return;
      }
    }

    const WLEDState = await getWLEDstate();
    if (WLEDState.on === false) {
      return;
    }


    const body = {
      on: true,
      bri: 255,
      transition: 7,
    };

    if (data.color || data.effect) {
      body.seg = [{}];

      if (data.color) {
        body.seg[0].col = [[data.color.r, data.color.g, data.color.b]];
      }

      if (data.effect) {
        body.seg[0].fx = data.effect.fx;
        body.seg[0].sx = data.effect.sx;
        body.seg[0].ix = data.effect.ix;
        body.seg[0].pal = data.effect.pal;
      }
    }

    await fetch(`${wledDomain}/json/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Error changing WLED state:', err);
  }
};

const handleWLEDEffectSolid = async (gameCode = null) => {
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

    await changeWLEDstate(data, gameCode);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDGameEnd = async (gameCode = null) => {
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

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await changeWLEDstate(data, gameCode);
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowDoors = async (gameCode = null) => {
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

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowT20 = async (gameCode = null) => {
  try {
    const data = {
      effect: {
        fx: 9,
        sx: 128,
        ix: 128,
        pal: 0
      }
    };

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1500);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrowD25 = async (gameCode = null) => {
  try {
    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 3000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDThrow180 = async (gameCode = null) => {
  try {
    const data = {
      effect: {
        fx: 63,
        sx: 128,
        ix: 0,
        pal: 0
      }
    };

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 10000);
  } catch (err) {
    console.error(err);
  }
};

const handleWLEDOverthrow = async (gameCode = null) => {
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

    await changeWLEDstate(data, gameCode);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await handleWLEDEffectSolid(gameCode);
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  setWledGameCodeGetter,
  handleWLEDEffectSolid,
  handleWLEDGameEnd,
  handleWLEDThrowDoors,
  handleWLEDThrowT20,
  handleWLEDThrowD25,
  handleWLEDThrow180,
  handleWLEDOverthrow
};
