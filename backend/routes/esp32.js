const express = require("express");
const authenticateUser = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { io } = require("../server");
const { logger } = require("../middleware/logging");
const { Expo } = require('expo-server-sdk');
const DoorUser = require('../models/door/doorUser');
const router = express.Router();

require('dotenv').config();

const wledDomain = process.env.WLED_DOMAIN;

let wledGameCode = "";

let doorExpo = new Expo({
  accessToken: process.env.EXPO_DOOR_ACCESS_TOKEN,
  useFcmV1: true
});

const sendDoorPushNotifications = async (title, body, data = {}) => {
  try {
    const doorUsers = await DoorUser.find({
      pushToken: { $ne: null, $exists: true }
    });

    if (doorUsers.length === 0) {
      console.warn('No door app push tokens found');
      return;
    }

    let messages = [];
    for (let doorUser of doorUsers) {
      if (!Expo.isExpoPushToken(doorUser.pushToken)) {
        console.error(`Push token ${doorUser.pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: doorUser.pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        badge: 1,
        priority: 'high',
        ttl: 86400,
        channelId: 'myNotificationChannel',
        android: {
          channelId: 'myNotificationChannel',
          sound: 'default',
          priority: 'max',
          sticky: true,
          vibrate: [0, 250, 250, 250],
          color: '#FF231F7C',
          style: {
            type: 'bigText',
            text: body
          }
        },
        ios: {
          sound: 'default',
          badge: 1,
          priority: 'high',
          subtitle: 'DoorApp',
          _displayInForeground: true,
          interruptionLevel: 'active',
          relevanceScore: 1.0
        }
      });
    }

    if (messages.length === 0) {
      console.warn('No valid door push tokens to send to');
      return;
    }

    let chunks = doorExpo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await doorExpo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending door push notification chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendDoorPushNotifications:', error);
  }
};

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

let validationStartHour = 22; // 22:00
let validationEndHour = 5;   // 5:00
let isValidationActive = true;
const validationTime = 30000; // default - 30000 (30 seconds)

const isWithinValidationWindow = () => {
  const now = new Date();
  const hour = now.getHours();
  if (validationStartHour < validationEndHour) {
    // e.g. 8 to 17
    return hour >= validationStartHour && hour < validationEndHour;
  } else {
    // e.g. 22 to 5 (overnight)
    return hour >= validationStartHour || hour < validationEndHour;
  }
};

const shouldValidate = () => {
  return isValidationActive || isWithinValidationWindow();
};

const validateCode = async (secretCode, req) => {
  if (!isValidationPending) {
    return {
      success: false,
      message: "No validation pending"
    };
  }

  if (secretCode === process.env.SECRET_CODE) {
    clearTimeout(validationTimer);
    validationTimer = null;
    isValidationPending = false;

    io.emit("esp32:validation-state-changed", isValidationPending);

    await sendDoorPushNotifications(
      'Weryfikacja udana',
      'Kod został poprawnie wprowadzony',
      { doorsUnlocked: true, validation: false, success: true }
    );

    logger.info("Door validation", {
      method: req.method,
      url: req.url,
      data: { message: "Validation successful" }
    });

    return {
      success: true,
      message: "Validation successful"
    };
  } else {
    logger.warn("Door validation", {
      method: req.method,
      url: req.url,
      data: { message: "Invalid code entered" }
    });

    return {
      success: false,
      message: "Invalid code"
    };
  }
};

router.post("/door/change-sensor-state/:newState", authenticateUser, async (req, res) => {
  try {
    const newState = parseInt(req.params?.newState);

    if (newState === 1 && shouldValidate()) {
      if (!isValidationPending) {
        isValidationPending = true;
        io.emit("esp32:validation-state-changed", isValidationPending);

        await sendDoorPushNotifications(
          'Drzwi otwarte',
          'Wymagana weryfikacja kodu!',
          { doorsUnlocked: true, validation: true }
        );

        validationTimer = setTimeout(() => {
          if (isValidationPending) {
            logger.warn("POST ESP32:door/change-sensor", { method: req.method, url: req.url, data: { message: "Validation failed", isValidationPending } });
            sendDoorPushNotifications(
              'Timeout weryfikacji',
              'Nie udało się zweryfikować kodu w wyznaczonym czasie',
              { doorsUnlocked: false, validation: false, timeout: true }
            );
          }
          isValidationPending = false;
          io.emit("esp32:validation-state-changed", isValidationPending);
        }, validationTime);
      }
    }

    io.emit("esp32:door-state-changed", newState);
    res.json({ newState });
  } catch (err) {
    logger.error("POST ESP32:door/change-sensor", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message });
  }
});

router.get("/door/validation-config", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  res.json({
    validationStartHour,
    validationEndHour,
    isValidationActive
  });
});

router.patch("/door/validation-config", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  const { updatedConfig } = req.body;

  const newConfig = {
    isValidationActive,
    validationStartHour,
    validationEndHour,
    ...updatedConfig
  };

  isValidationActive = newConfig.isValidationActive;
  validationStartHour = newConfig.validationStartHour;
  validationEndHour = newConfig.validationEndHour;

  res.json(newConfig);
});

router.post("/door/set-validation-window", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  const { startHour, endHour } = req.body;

  if (
    typeof startHour === "number" && startHour >= 0 && startHour < 24 &&
    typeof endHour === "number" && endHour >= 0 && endHour < 24
  ) {
    validationStartHour = startHour;
    validationEndHour = endHour;
    res.json({ success: true, validationStartHour, validationEndHour });
  } else {
    res.status(400).json({ success: false, message: "Invalid hours" });
  }
});

router.post("/door/set-validation-active", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  const { active } = req.body;

  if (typeof active === "boolean") {
    isValidationActive = active;
    res.json({ success: true, isValidationActive });
  } else {
    res.status(400).json({ success: false, message: "Invalid value" });
  }
});

router.post("/door/validate", async (req, res) => {
  try {
    const { secretCode } = req.body;

    const result = await validateCode(secretCode, req);

    if (result.success) {
      return res.json({ message: result.message, success: true });
    } else {
      throw new Error(result.message);
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

// Door push notification endpoints

router.post("/door/register-push-token", async (req, res) => {
  try {
    const { pushToken, deviceId } = req.body;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error('Invalid push token format:', pushToken);
      return res.status(400).json({ error: 'Invalid push token' });
    }

    let doorUser = await DoorUser.findOne({ deviceId });

    if (doorUser) {
      doorUser.pushToken = pushToken;
      doorUser.lastActive = new Date();
      await doorUser.save();
    } else {
      doorUser = new DoorUser({
        deviceId,
        pushToken,
        lastActive: new Date()
      });
      await doorUser.save();
    }

    res.json({ success: true, message: 'Door push token registered' });
  } catch (err) {
    console.error('Error in register-push-token:', err);
    logger.error("POST ESP32:door/register-push-token", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.post("/door/send-notification", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    const { title, body, data } = req.body;

    const tickets = await sendDoorPushNotifications(
      title || 'Door Notification',
      body || 'Test notification',
      data || {}
    );

    res.json({ success: true, tickets });
  } catch (err) {
    logger.error("POST ESP32:door/send-notification", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

// Additional door user management endpoints

router.get("/door/test-database", async (req, res) => {
  try {
    const allDoorUsers = await DoorUser.find({});
    console.log('All door users in database:', allDoorUsers);
    res.json({
      success: true,
      totalUsers: allDoorUsers.length,
      users: allDoorUsers
    });
  } catch (err) {
    console.error('Error querying door users:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/door/registered-devices", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    const doorUsers = await DoorUser.find({}).select('deviceId lastActive createdAt');
    res.json({
      success: true,
      devices: doorUsers,
      count: doorUsers.length
    });
  } catch (err) {
    logger.error("GET ESP32:door/registered-devices", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.delete("/door/remove-device/:deviceId", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    const { deviceId } = req.params;

    const deletedUser = await DoorUser.findOneAndDelete({ deviceId });

    if (!deletedUser) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, message: 'Device removed' });
  } catch (err) {
    logger.error("DELETE ESP32:door/remove-device", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.post("/door/cleanup-inactive-devices", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    const daysInactive = req.body.days || 30;
    const cutoffDate = new Date(Date.now() - (daysInactive * 24 * 60 * 60 * 1000));

    const result = await DoorUser.deleteMany({
      lastActive: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Removed ${result.deletedCount} inactive devices`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    logger.error("POST ESP32:door/cleanup-inactive-devices", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

// Keypad handle

let currentCode = "";

router.get("/door/keypad/get-keypad-strokes", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    res.json(currentCode);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post("/door/keypad/send-keypad-stroke/:keyStroke", authenticateUser, async (req, res) => {
  try {
    const keyStroke = decodeURIComponent(req.params?.keyStroke);

    const enterButton = "#";
    const resetButton = "*";
    const ABCD = "ABCD";

    if (keyStroke === enterButton) {
      const codeToValidate = currentCode;
      currentCode = "";

      const result = await validateCode(codeToValidate, req);

      io.emit("esp32:keypad-validation-result", {
        success: result.success,
        message: result.message
      });
    } else if (keyStroke === resetButton) {
      currentCode = "";
    } else if (!ABCD.includes(keyStroke)) {
      currentCode += keyStroke;
    }

    io.emit("esp32:keypad-stroke", keyStroke);

    res.json({ currentCode });
  } catch (err) {
    logger.error("POST ESP32:door/change-sensor", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message });
  }
});

module.exports = router;