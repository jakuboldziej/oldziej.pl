const express = require("express");
const authenticateUser = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { io } = require("../server");
const { logger } = require("../middleware/logging");
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
    return { message: err.message };
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

    const gameCode = req.body.gameCode;
    const role = req.body.role;

    if (!role) {
      if (!wledGameCode) return res.json({ message: "No running game" });
      if (gameCode !== wledGameCode) return res.json({ message: "Game code does not match" });
    } else if (role !== "admin") return res.json({ message: "Not authorized" });

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

    const response = await changeWLEDstate({
      stateOn: true,
      stateColor: { r: 255, g: 255, b: 255 },
      stateEffect: {
        fx: 0,
        sx: 0,
        ix: 0,
        pal: 0
      }
    });

    if (response.message) throw new Error("ESP32 failed", response.message);

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
    const gameCode = req.params?.gameCode;

    let available = false;

    const decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    if (decoded.userEmail !== process.env.ADMIN_EMAIL) return res.json({ available: false });

    if (gameCode && gameCode != "undefined") {
      if (gameCode === wledGameCode) available = true;
      else available = false;
    } else {
      if (wledGameCode) available = false;
      else available = true;
    }

    await fetch(`${wledDomain}/json/state`);

    res.json({ available });
  } catch (err) {
    res.json({ message: err.message, available: false });
  }
});

// Door

let validationTimer = null;
let isValidationPending = false;

router.post("/door/change-sensor-state/:newState", async (req, res) => {
  try {
    const newState = parseInt(req.params?.newState);

    if (newState === 1) {
      isValidationPending = true;
      if (validationTimer) clearTimeout(validationTimer);

      io.emit("esp32:validation-state-changed", isValidationPending);

      validationTimer = setTimeout(() => {
        if (isValidationPending) {
          logger.warn("POST ESP32:door/change-sensor", { method: req.method, url: req.url, data: { message: "Validation failed", isValidationPending } });
          // notification
        }

        isValidationPending = false;
        io.emit("esp32:validation-state-changed", isValidationPending);
      }, 30000); // default - 30000 (30 seconds)

    }

    io.emit("esp32:door-state-changed", newState);

    res.json({ newState });
  } catch (err) {
    logger.error("POST ESP32:door/change-sensor", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message });
  }
});

router.post("/door/validate", async (req, res) => {
  try {
    const { secretCode } = req.body;

    if (!isValidationPending) throw new Error("No validation pending")

    if (secretCode === process.env.SECRET_CODE) {
      clearTimeout(validationTimer);
      validationTimer = null;
      isValidationPending = false;

      io.emit("esp32:validation-state-changed", isValidationPending);

      logger.info("POST ESP32:door/validate", { method: req.method, url: req.url, data: { message: "Validation successfull" } });
      return res.json({ message: "Validation successful", success: true });
    } else {
      throw new Error("Invalid code");
    }
  } catch (err) {
    logger.error("POST ESP32:door/validate", { method: req.method, url: req.url, error: err });
    res.status(400).json({ message: err.message, success: false });
  }
});

router.get("/door/check-if-validation-needed", async (req, res) => {
  try {
    return res.json(isValidationPending);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;