const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();

require('dotenv').config();

const wledDomain = process.env.WLED_DOMAIN;
let wledGameCode = "";

const getWLEDstate = async () => {
  try {
    const response = await fetch(`${wledDomain}/json/state`);
    const responseData = await response.json();

    return responseData;
  } catch (err) {
    return { message: err.message };
  }
}

const changeWLEDstate = async (data) => {
  try {
    const {
      stateOn,
      stateBri,
      stateColor,
      stateEffect
    } = data;

    let patchData = {
      "v": true,
      seg: []
    }

    if (stateOn && stateOn === "toggle") {
      const WLEDstate = await getWLEDstate();
      if (WLEDstate.on === true) patchData.on = false;
      else patchData.on = true;
    } else if (stateOn !== undefined) {
      patchData.on = stateOn;
    }

    if (stateBri) { patchData.bri = stateBri; }

    if (stateColor) {
      patchData.seg[0] = {
        ...patchData.seg[0],
        col: [[stateColor.r, stateColor.g, stateColor.b]]
      };
    }

    if (stateEffect) {
      patchData.seg[0] = {
        ...patchData.seg[0],
        fx: stateEffect.fx,
        sx: stateEffect.sx,
        ix: stateEffect.ix,
        pal: stateEffect.pal
      };
    }

    const response = await fetch(`${wledDomain}/json/state`, {
      method: "POST",
      body: JSON.stringify(patchData),
    });
    const responseData = await response.json();

    return responseData;
  } catch (err) {
    console.error(err);
  }
}

router.get("/json-info", authenticateUser, async (req, res) => {
  try {
    const response = await fetch(`${wledDomain}/json/info`);
    const responseData = await response.json();

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/json-state", authenticateUser, async (req, res) => {
  const WLEDstate = await getWLEDstate();

  res.json(WLEDstate);
});

router.get("/json-effects", authenticateUser, async (req, res) => {
  try {
    const response = await fetch(`${wledDomain}/json/effects`);
    const responseData = await response.json();

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/json-palettes", authenticateUser, async (req, res) => {
  try {
    const response = await fetch(`${wledDomain}/json/palettes`);
    const responseData = await response.json();

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.patch("/change-state", authenticateUser, async (req, res) => {
  try {
    const stateOn = req.body.on;
    const stateBri = req.body.bri;
    const stateColor = req.body.color;
    const stateEffect = req.body.effect;

    const responseData = await changeWLEDstate({
      stateOn: stateOn,
      stateBri: stateBri,
      stateColor: stateColor,
      stateEffect: stateEffect
    });

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
});

// Control darts game

router.post("/join-game/:gameCode", authenticateUser, async (req, res) => {
  try {
    const gameCode = req.params.gameCode;
    wledGameCode = gameCode;

    await changeWLEDstate({
      stateOn: true,
      stateColor: { r: 255, g: 255, b: 255 },
      stateEffect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    });

    res.json(wledGameCode);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post("/leave-game/:gameCode", authenticateUser, async (req, res) => {
  try {
    const gameCode = req.params.gameCode;

    if (wledGameCode === gameCode) {
      wledGameCode = "";

      await changeWLEDstate({
        stateOn: false,
        stateColor: { r: 255, g: 255, b: 255 },
        stateEffect: {
          fx: 0,
          sx: 0,
          ix: 0,
          pal: 0
        }
      });

      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/check-availability/:gameCode", authenticateUser, async (req, res) => {
  try {
    const gameCode = req.params.gameCode;

    let available = true;

    if (gameCode && gameCode != "undefined") {
      if (gameCode === wledGameCode) available = true;
      else available = false;
    } else {
      if (wledGameCode) available = false;
      else available = true;
    }

    res.json({ available });
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router