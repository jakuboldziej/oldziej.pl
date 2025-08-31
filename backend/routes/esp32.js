const express = require("express");
const authenticateUser = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { io } = require("../server");
const { logger } = require("../middleware/logging");
const { Expo } = require('expo-server-sdk');
const DoorUser = require('../models/esp32/door/doorUser');
const GeoAuthorizedDevice = require('../models/esp32/door/geoAuthorizedDevices');
const ESP32Config = require('../models/esp32/esp32Config');
const router = express.Router();

require('dotenv').config();

const wledDomain = process.env.WLED_DOMAIN;

let wledGameCode = "";

let doorExpo = new Expo({
  accessToken: process.env.EXPO_DOOR_ACCESS_TOKEN,
  useFcmV1: true
});

const sendDoorPushNotifications = async (title, body, data = {}, isCritical = false) => {
  try {
    const doorUsers = await DoorUser.find({
      pushToken: { $ne: null, $exists: true }
    });

    if (doorUsers.length === 0) {
      console.warn('No door app push tokens found');
      return;
    }

    const isAlarmOrValidation = data.validation || data.security || data.alert || isCritical;
    const channelId = isAlarmOrValidation ? 'criticalAlerts' : 'myNotificationChannel';

    if (isAlarmOrValidation && !title.includes('⚠️')) {
      title = `⚠️ ${title} ⚠️`;
    }

    let messages = [];
    for (let doorUser of doorUsers) {
      if (!Expo.isExpoPushToken(doorUser.pushToken)) {
        console.error(`Push token ${doorUser.pushToken} is not a valid Expo push token`);
        continue;
      }

      const soundName = isAlarmOrValidation ? 'nuclear_alarm.mp3' : 'default';

      messages.push({
        to: doorUser.pushToken,
        sound: soundName,
        title: title,
        body: body,
        data: { ...data, isCritical: isAlarmOrValidation },
        badge: 1,
        priority: 'high',
        ttl: 86400,
        channelId: channelId,
        android: {
          channelId: channelId,
          sound: isAlarmOrValidation ? 'nuclear_alarm.mp3' : 'default',
          priority: 'max',
          sticky: true,
          vibrate: isAlarmOrValidation
            ? [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
            : [0, 500, 250, 500, 250, 500],
          color: isAlarmOrValidation ? '#FF0000' : '#FF231F7C',
          style: {
            type: 'bigText',
            text: body
          }
        },
        ios: {
          sound: soundName,
          badge: 1,
          priority: 'high',
          subtitle: isAlarmOrValidation ? 'ALARM SYSTEMOWY' : 'DoorApp',
          _displayInForeground: true,
          interruptionLevel: isAlarmOrValidation ? 'critical' : 'active',
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
let validationAttempts = 0;
const MAX_VALIDATION_ATTEMPTS = 3;

const validationTime = 3000; // default - 30000 (30 seconds)

const initializeDoorConfiguration = async () => {
  try {
    const doorConfig = await ESP32Config.findOne({ name: 'ESP32-door-sensor' });

    if (!doorConfig) {
      await ESP32Config.create({
        name: 'ESP32-door-sensor',
        config: {
          isValidationActive: true,
          validationStartHour: 22,
          validationEndHour: 5
        }
      });

      logger.info('Created default door configuration in database');
    }
  } catch (error) {
    logger.error('Error initializing door configuration', { error: error.message });
  }
};

// Initialize configuration when server starts
initializeDoorConfiguration();

const getDoorConfig = async () => {
  try {
    const doorConfig = await ESP32Config.findOne({ name: 'ESP32-door-sensor' });
    if (!doorConfig || !doorConfig.config) {
      return {
        isValidationActive: true,
        validationStartHour: 22,
        validationEndHour: 5
      };
    }
    return doorConfig.config;
  } catch (error) {
    logger.error('Error getting door configuration', { error: error.message });
    return {
      isValidationActive: true,
      validationStartHour: 22,
      validationEndHour: 5
    };
  }
};

const isWithinValidationWindow = async () => {
  const config = await getDoorConfig();

  if (config.validationStartHour === 0 && config.validationEndHour === 0) return true;

  const now = new Date();
  const hour = now.getHours();
  if (config.validationStartHour < config.validationEndHour) {
    // e.g. 8 to 17
    return hour >= config.validationStartHour && hour < config.validationEndHour;
  } else {
    // e.g. 22 to 5 (overnight)
    return hour >= config.validationStartHour || hour < config.validationEndHour;
  }
};

const shouldValidate = async () => {
  const config = await getDoorConfig();
  if (config.isValidationActive === false) return false;

  return await isWithinValidationWindow();
};

const validateCode = async (secretCode, req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

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
    validationAttempts = 0;

    io.emit("esp32:validation-state-changed", isValidationPending);

    await sendDoorPushNotifications(
      'Weryfikacja udana',
      'Kod został poprawnie wprowadzony',
      { doorsUnlocked: true, validation: false, success: true }
    );

    logger.info("Door validation", {
      method: req.method,
      url: req.url,
      ip,
      data: { message: "Validation successful" }
    });

    return {
      success: true,
      message: "Validation successful"
    };
  } else {
    validationAttempts++;

    if (validationAttempts >= MAX_VALIDATION_ATTEMPTS) {
      clearTimeout(validationTimer);
      validationTimer = null;
      isValidationPending = false;
      validationAttempts = 0;

      io.emit("esp32:validation-state-changed", isValidationPending);

      await sendDoorPushNotifications(
        'Weryfikacja nieudana',
        'Przekroczono maksymalną liczbę prób',
        { doorsUnlocked: false, validation: false, maxAttempts: true }
      );

      logger.warn("Door validation", {
        method: req.method,
        url: req.url,
        ip,
        data: { message: "Max validation attempts reached", attempts: MAX_VALIDATION_ATTEMPTS }
      });

      return {
        success: false,
        message: "Max attempts reached",
        maxAttemptsReached: true
      };
    }

    const attemptsLeft = MAX_VALIDATION_ATTEMPTS - validationAttempts;

    logger.warn("Door validation", {
      method: req.method,
      url: req.url,
      ip,
      data: { message: "Invalid code entered", attemptNumber: validationAttempts, attemptsLeft }
    });

    return {
      success: false,
      message: `Invalid code. ${attemptsLeft} attempts left`,
      attemptsLeft: attemptsLeft
    };
  }
};

router.post("/door/change-sensor-state/:newState", authenticateUser, async (req, res) => {
  try {
    const newState = parseInt(req.params?.newState);

    if (newState === 1 && await shouldValidate()) {
      if (!isValidationPending) {
        isValidationPending = true;
        validationAttempts = 0;
        io.emit("esp32:validation-state-changed", isValidationPending);

        await sendDoorPushNotifications(
          'Drzwi otwarte',
          'Wymagana weryfikacja kodu! Natychmiastowa uwaga!',
          { doorsUnlocked: true, validation: true, alert: true },
          true
        );

        validationTimer = setTimeout(() => {
          if (isValidationPending) {
            logger.warn("POST ESP32:door/change-sensor", { method: req.method, url: req.url, data: { message: "Validation failed", isValidationPending } });
            sendDoorPushNotifications(
              'Timeout weryfikacji',
              'Nie udało się zweryfikować kodu w wyznaczonym czasie! UWAGA: Możliwe zagrożenie bezpieczeństwa!',
              { doorsUnlocked: false, validation: false, timeout: true, alert: true },
              true
            );
          }
          isValidationPending = false;
          validationAttempts = 0;
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
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const config = await getDoorConfig();
    res.json(config);
  } catch (error) {
    logger.error('Error getting door validation config', { error: error.message });
    res.status(500).json({ message: "Error fetching configuration" });
  }
});

router.patch("/door/validation-config", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { updatedConfig } = req.body;
    const currentConfig = await getDoorConfig();

    const newConfig = {
      ...currentConfig,
      ...updatedConfig
    };

    const result = await ESP32Config.findOneAndUpdate(
      { name: 'ESP32-door-sensor' },
      {
        name: 'ESP32-door-sensor',
        config: newConfig
      },
      { upsert: true, new: true }
    );

    logger.info('Door configuration updated', newConfig);
    res.json(result.config);
  } catch (error) {
    logger.error('Error updating door validation config', { error: error.message });
    res.status(500).json({ message: "Error updating configuration" });
  }
});

router.post("/door/set-validation-window", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { startHour, endHour } = req.body;

    if (
      typeof startHour === "number" && startHour >= 0 && startHour < 24 &&
      typeof endHour === "number" && endHour >= 0 && endHour < 24
    ) {
      const currentConfig = await getDoorConfig();

      const updatedConfig = await ESP32Config.findOneAndUpdate(
        { name: 'ESP32-door-sensor' },
        {
          name: 'ESP32-door-sensor',
          config: {
            ...currentConfig,
            validationStartHour: startHour,
            validationEndHour: endHour
          }
        },
        { upsert: true, new: true }
      );

      logger.info('Validation window updated', {
        validationStartHour: updatedConfig.config.validationStartHour,
        validationEndHour: updatedConfig.config.validationEndHour
      });

      res.json({
        success: true,
        validationStartHour: updatedConfig.config.validationStartHour,
        validationEndHour: updatedConfig.config.validationEndHour
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid hours" });
    }
  } catch (error) {
    logger.error('Error setting validation window', { error: error.message });
    res.status(500).json({ success: false, message: "Error updating configuration" });
  }
});

router.post("/door/set-validation-active", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { active } = req.body;

    if (typeof active === "boolean") {
      const currentConfig = await getDoorConfig();

      const updatedConfig = await ESP32Config.findOneAndUpdate(
        { name: 'ESP32-door-sensor' },
        {
          name: 'ESP32-door-sensor',
          config: {
            ...currentConfig,
            isValidationActive: active
          }
        },
        { upsert: true, new: true }
      );

      logger.info('Validation active state updated', {
        isValidationActive: updatedConfig.config.isValidationActive
      });

      res.json({
        success: true,
        isValidationActive: updatedConfig.config.isValidationActive
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid value" });
    }
  } catch (error) {
    logger.error('Error setting validation active state', { error: error.message });
    res.status(500).json({ success: false, message: "Error updating configuration" });
  }
});

router.post("/door/validate", async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const { secretCode } = req.body;

    const result = await validateCode(secretCode, req);

    if (result.success) {
      return res.json({
        message: result.message,
        success: true
      });
    } else {
      return res.json({
        message: result.message,
        success: false,
        attemptsLeft: result.attemptsLeft,
        maxAttemptsReached: result.maxAttemptsReached
      });
    }
  } catch (err) {
    logger.error("POST ESP32:door/validate", { method: req.method, url: req.url, ip, error: err });
    res.status(400).json({ message: err.message, success: false });
  }
});

router.post("/door/validate-with-geo", async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    if (!isValidationPending) {
      return res.json({
        success: false,
        message: "No validation pending"
      });
    }

    const device = await GeoAuthorizedDevice.findOne({ deviceId });
    if (!device || !device.enabled) {
      logger.warn("POST ESP32:door/validate-with-geo", {
        method: req.method,
        url: req.url,
        ip,
        data: { message: "Unauthorized device attempted geo validation", deviceId }
      });

      return res.status(403).json({
        success: false,
        message: "Device not authorized for geo validation"
      });
    }

    device.lastActive = new Date();
    await device.save();

    clearTimeout(validationTimer);
    validationTimer = null;
    isValidationPending = false;
    validationAttempts = 0;

    io.emit("esp32:validation-state-changed", isValidationPending);

    await sendDoorPushNotifications(
      'Weryfikacja automatyczna',
      'Kod został automatycznie zweryfikowany przez geolokalizację - system działał prawidłowo',
      { doorsUnlocked: true, validation: false, success: true, viaGeolocation: true }
    );

    logger.info("Door validation via geolocation", {
      method: req.method,
      url: req.url,
      ip,
      deviceId,
      data: { message: "Validation successful via geolocation" }
    });

    return res.json({
      success: true,
      message: "Validation successful via geolocation"
    });
  } catch (err) {
    logger.error("POST ESP32:door/validate-with-geo", { method: req.method, url: req.url, ip, error: err });
    res.status(500).json({ message: err.message, success: false });
  }
});

router.get("/door/check-if-validation-needed", async (req, res) => {
  try {
    return res.json(isValidationPending);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/door/check-geo-authorization", async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        authorized: false,
        message: 'Device ID is required'
      });
    }

    const device = await GeoAuthorizedDevice.findOne({ deviceId });

    if (!device) {
      return res.json({
        authorized: false,
        message: 'To urządzenie nie jest autoryzowane'
      });
    }

    if (!device.enabled) {
      return res.json({
        authorized: false,
        message: 'Autoryzacja dla tego urządzenia została wyłączona'
      });
    }

    device.lastActive = new Date();
    await device.save();

    return res.json({
      authorized: true,
      message: 'Urządzenie autoryzowane'
    });

  } catch (err) {
    logger.error("POST ESP32:door/check-geo-authorization", {
      method: req.method,
      url: req.url,
      error: err.message
    });
    res.status(500).json({
      authorized: false,
      message: 'Wystąpił błąd podczas sprawdzania autoryzacji'
    });
  }
});

router.post("/door/unlock-via-geo", async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    const device = await GeoAuthorizedDevice.findOne({ deviceId });

    if (!device || !device.enabled) {
      return res.status(403).json({
        success: false,
        message: 'Urządzenie nie jest autoryzowane'
      });
    }

    device.lastActive = new Date();
    await device.save();

    io.emit("esp32:door-state-changed", 1);

    await sendDoorPushNotifications(
      'Drzwi odblokowane',
      'Drzwi zostały automatycznie odblokowane przez geolokalizację',
      { doorsUnlocked: true, viaGeolocation: true }
    );

    logger.info("Door unlocked via geolocation", {
      deviceId,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: 'Drzwi odblokowane pomyślnie'
    });

  } catch (err) {
    logger.error("POST ESP32:door/unlock-via-geo", {
      method: req.method,
      url: req.url,
      error: err.message
    });
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas odblokowywania drzwi'
    });
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

router.get("/door/test-database", authenticateUser, async (req, res) => {
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

router.get("/door/geo-authorized-devices", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const devices = await GeoAuthorizedDevice.find({});
    res.json({
      success: true,
      devices,
      count: devices.length
    });
  } catch (err) {
    logger.error("GET ESP32:door/geo-authorized-devices", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.post("/door/add-geo-authorized-device", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { deviceId, description } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: "Device ID is required" });
    }

    let device = await GeoAuthorizedDevice.findOne({ deviceId });

    if (device) {
      device.enabled = true;
      device.description = description || device.description;
      device.lastActive = new Date();
      await device.save();

      return res.json({
        success: true,
        message: 'Device authorization updated',
        device
      });
    }

    device = new GeoAuthorizedDevice({
      deviceId,
      description: description || '',
      enabled: true,
      createdAt: new Date(),
      lastActive: new Date()
    });

    await device.save();

    res.json({
      success: true,
      message: 'Device added to authorized list',
      device
    });
  } catch (err) {
    logger.error("POST ESP32:door/add-geo-authorized-device", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.patch("/door/update-geo-authorized-device/:deviceId", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { deviceId } = req.params;
    const { enabled, description } = req.body;

    const device = await GeoAuthorizedDevice.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (typeof enabled === 'boolean') {
      device.enabled = enabled;
    }

    if (description) {
      device.description = description;
    }

    device.lastActive = new Date();
    await device.save();

    res.json({
      success: true,
      message: 'Device authorization updated',
      device
    });
  } catch (err) {
    logger.error("PATCH ESP32:door/update-geo-authorized-device", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.delete("/door/remove-geo-authorized-device/:deviceId", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const { deviceId } = req.params;

    const result = await GeoAuthorizedDevice.findOneAndDelete({ deviceId });

    if (!result) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      success: true,
      message: 'Device removed from authorized list'
    });
  } catch (err) {
    logger.error("DELETE ESP32:door/remove-geo-authorized-device", { method: req.method, url: req.url, error: err.message });
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
        message: result.message,
        attemptsLeft: result.attemptsLeft,
        maxAttemptsReached: result.maxAttemptsReached
      });
    } else if (keyStroke === resetButton) {
      currentCode = "";
    } else if (!ABCD.includes(keyStroke)) {
      currentCode += keyStroke;
    }

    io.emit("esp32:keypad-stroke", keyStroke);

    res.json({ currentCode });
  } catch (err) {
    logger.error("POST ESP32:door/send-keypad-stroke", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message });
  }
});

module.exports = router;