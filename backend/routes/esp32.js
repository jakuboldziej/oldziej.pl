const express = require("express");
const authenticateUser = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { io } = require("../server");
const { logger } = require("../middleware/logging");
const { Expo } = require('expo-server-sdk');
const admin = require('firebase-admin');
const DoorUser = require('../models/esp32/door/doorUser');
const GeoAuthorizedDevice = require('../models/esp32/door/geoAuthorizedDevices');
const ESP32Config = require('../models/esp32/esp32Config');
const router = express.Router();
const TelegramBot = require("node-telegram-bot-api");

require('dotenv').config();

const environment = process.env.NODE_ENV || "production";
const domain = environment === "production" ? process.env.BACKEND_DOMAIN : process.env.BACKEND_DOMAIN_LOCAL;

const wledDomain = process.env.WLED_DOMAIN;

let wledGameCode = {
  code: "",
  joinedAt: null
};

let firebaseApp = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin SDK initialized for FCM');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
}

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

    const soundName = isAlarmOrValidation ? 'nuclear_alarm' : 'default';

    const fcmUsers = doorUsers.filter(user => user.tokenType === 'fcm' || (!user.tokenType && !Expo.isExpoPushToken(user.pushToken)));
    const expoUsers = doorUsers.filter(user => user.tokenType === 'expo' || (!user.tokenType && Expo.isExpoPushToken(user.pushToken)));

    const results = [];

    // Send FCM notifications if Firebase is available
    if (fcmUsers.length > 0 && firebaseApp) {
      console.log(`Sending FCM notifications to ${fcmUsers.length} users`);
      const fcmResult = await sendFCMNotifications(fcmUsers, title, body, data, isAlarmOrValidation, channelId, soundName);
      results.push({ type: 'fcm', result: fcmResult });
    } else if (fcmUsers.length > 0) {
      console.warn('FCM users found but Firebase not configured');
    }

    // Send Expo notifications
    if (expoUsers.length > 0) {
      console.log(`Sending Expo notifications to ${expoUsers.length} users`);
      const expoResult = await sendExpoNotifications(expoUsers, title, body, data, isAlarmOrValidation, channelId, soundName);
      results.push({ type: 'expo', result: expoResult });
    }

    return results;
  } catch (error) {
    console.error('Error in sendDoorPushNotifications:', error);
  }
};

const sendFCMNotifications = async (doorUsers, title, body, data, isAlarmOrValidation, channelId, soundName) => {
  try {
    const messages = [];

    for (let doorUser of doorUsers) {
      if (!doorUser.pushToken || doorUser.pushToken.length < 100) {
        console.error(`Invalid FCM token for user ${doorUser.deviceId}`);
        continue;
      }

      const message = {
        token: doorUser.pushToken,
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          isCritical: String(isAlarmOrValidation),
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            channelId: channelId,
            sound: soundName,
            priority: 'max',
            color: isAlarmOrValidation ? '#FF0000' : '#FF231F7C',
            vibrateTimingsMillis: isAlarmOrValidation
              ? [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
              : [0, 500, 250, 500, 250, 500],
            sticky: true,
            defaultVibrateTimings: false,
            visibility: 'public',
            localOnly: false,
            defaultSound: false,
            defaultLightSettings: false
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: title,
                body: body
              },
              badge: 1,
              sound: soundName === 'nuclear_alarm' ? 'nuclear_alarm.wav' : 'default',
              'content-available': 1,
              category: isAlarmOrValidation ? 'CRITICAL_ALERT' : 'DOOR_NOTIFICATION'
            }
          }
        }
      };

      messages.push(message);
    }

    if (messages.length === 0) {
      console.warn('No valid FCM tokens to send to');
      return [];
    }

    console.log(`Sending ${messages.length} FCM notifications`);
    const response = await admin.messaging().sendAll(messages);

    console.log(`FCM Response: ${response.successCount} successful, ${response.failureCount} failed`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`FCM failed for token ${messages[idx].token}: ${resp.error}`);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Error sending FCM notifications:', error);
    throw error;
  }
};

const sendExpoNotifications = async (doorUsers, title, body, data, isAlarmOrValidation, channelId, soundName) => {
  try {
    let messages = [];

    for (let doorUser of doorUsers) {
      if (!Expo.isExpoPushToken(doorUser.pushToken)) {
        console.error(`Push token ${doorUser.pushToken} is not a valid Expo push token`);
        continue;
      }

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
          sound: soundName,
          priority: 'max',
          sticky: true,
          color: isAlarmOrValidation ? '#FF0000' : '#FF231F7C',
          vibrate: isAlarmOrValidation
            ? [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
            : [0, 500, 250, 500, 250, 500],
          style: {
            type: 'bigText',
            text: body
          }
        }
      });
    }

    if (messages.length === 0) {
      console.warn('No valid Expo push tokens to send to');
      return [];
    }

    let chunks = doorExpo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await doorExpo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending Expo push notification chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error sending Expo notifications:', error);
    throw error;
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
      if (!wledGameCode.code) return res.json({ message: "No running game" });
      if (gameCode !== wledGameCode.code) return res.json({ message: "Game code does not match" });
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
    wledGameCode = {
      code: gameCode,
      joinedAt: Date.now()
    };

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

    logger.info("WLED joined game", { gameCode, timestamp: wledGameCode.joinedAt });
    res.json(wledGameCode.code);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post("/leave-game/:gameCode", authenticateUser, async (req, res) => {
  try {
    const gameCode = req.params.gameCode;

    if (wledGameCode.code === gameCode) {
      wledGameCode = {
        code: "",
        joinedAt: null
      };

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

      logger.info("WLED left game", { gameCode });
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post("/force-reset-wled", authenticateUser, async (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    if (decoded.userEmail !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const previousGameCode = wledGameCode.code;

    wledGameCode = {
      code: "",
      joinedAt: null
    };

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

    logger.info("WLED force reset", { previousGameCode });

    res.json({
      success: true,
      message: "WLED state reset successfully",
      previousGameCode
    });
  } catch (err) {
    logger.error("Force reset WLED error", { error: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/check-availability/:gameCode", authenticateUser, async (req, res) => {
  try {
    const gameCode = req.params?.gameCode;

    let available = false;

    const decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    if (decoded.userEmail !== process.env.ADMIN_EMAIL) return res.json({ available: false });

    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    if (wledGameCode.code && wledGameCode.joinedAt) {
      if (Date.now() - wledGameCode.joinedAt > TWELVE_HOURS) {
        logger.warn("Auto-clearing stale WLED game code", {
          oldGameCode: wledGameCode.code,
          age: Math.round((Date.now() - wledGameCode.joinedAt) / 1000 / 60) + " minutes"
        });
        wledGameCode = { code: "", joinedAt: null };
      }
    }

    if (wledGameCode.code) {
      const DartsGame = require('../models/dartsGame');
      const currentGame = await DartsGame.findOne({ gameCode: wledGameCode.code });

      if (!currentGame || currentGame.active === false) {
        logger.warn("Clearing WLED game code - game no longer active", {
          gameCode: wledGameCode.code,
          gameExists: !!currentGame,
          gameActive: currentGame?.active
        });
        wledGameCode = { code: "", joinedAt: null };
      }
    }

    if (gameCode && gameCode != "undefined") {
      if (gameCode === wledGameCode.code) available = true;
      else available = false;
    } else {
      if (wledGameCode.code) available = false;
      else available = true;
    }

    await fetch(`${wledDomain}/json/state`);

    res.json({ available, currentGameCode: wledGameCode.code || null });
  } catch (err) {
    res.json({ message: err.message, available: false });
  }
});

// Telegram bot

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let telegramBot = null;

if (TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN);

  if (environment === "production" && domain && domain.startsWith('https://')) {
    telegramBot.setWebHook(`${domain}/bot${TELEGRAM_BOT_TOKEN}`)
      .then(() => {
        logger.info('Telegram webhook set successfully');
      })
      .catch((error) => {
        console.error('Error setting Telegram webhook:', error.message);
      });
  } else {
    if (environment !== "production") {
      telegramBot.startPolling()
        .then(() => {
          logger.info('Telegram bot polling started for development');
        })
        .catch((error) => {
          console.error('Error starting Telegram polling:', error.message);
        });
    }
  }
}

router.post(`/bot${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
  if (!telegramBot) {
    return res.status(400).json({ error: 'Telegram bot not configured' });
  }

  try {
    telegramBot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

const sendTelegramNotification = async (message, options = {}) => {
  if (!telegramBot || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram bot or chat ID not configured');
    return false;
  }

  try {
    const defaultOptions = {
      parse_mode: 'Markdown',
      disable_notification: false,
      ...options
    };

    await telegramBot.sendMessage(TELEGRAM_CHAT_ID, message, defaultOptions);
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error.message);
    return false;
  }
};

// Door

let validationTimer = null;
let isValidationPending = false;
let validationAttempts = 0;
const MAX_VALIDATION_ATTEMPTS = 3;

const validationTime = 30000; // default - 30000 (30 seconds)

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

    await sendTelegramNotification(
      `✅ *WERYFIKACJA UDANA* ✅\n\n` +
      `🔐 *Kod został poprawnie wprowadzony*\n\n` +
      `📍 *Lokalizacja:* Główne wejście\n` +
      `⏰ *Czas:* ${new Date().toLocaleString('pl-PL')}\n` +
      `🌐 *IP:* ${ip}\n\n` +
      `✅ *Status:* Dostęp autoryzowany`
    );

    logger.info("Door validation", {
      method: req.method,
      url: req.url,
      ip,
      data: { message: "Validation successful" }
    });

    io.emit("esp32:validation-response", { success: true });

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

      await sendTelegramNotification(
        `🚨 *ALARM BEZPIECZEŃSTWA* 🚨\n\n` +
        `❌ *Weryfikacja nieudana - Przekroczono maksymalną liczbę prób*\n\n` +
        `📍 *Lokalizacja:* Główne wejście\n` +
        `⏰ *Czas:* ${new Date().toLocaleString('pl-PL')}\n` +
        `🔢 *Próby:* ${MAX_VALIDATION_ATTEMPTS}/${MAX_VALIDATION_ATTEMPTS}\n` +
        `🌐 *IP:* ${ip}\n\n` +
        `⚠️ *Status:* Dostęp zablokowany`
      );

      logger.warn("Door validation", {
        method: req.method,
        url: req.url,
        ip,
        data: { message: "Max validation attempts reached", attempts: MAX_VALIDATION_ATTEMPTS }
      });

      io.emit("esp32:validation-response", { success: false });

      return {
        success: false,
        message: "Max attempts reached",
        maxAttemptsReached: true
      };
    }

    const attemptsLeft = MAX_VALIDATION_ATTEMPTS - validationAttempts;

    await sendTelegramNotification(
      `⚠️ *Nieprawidłowy kod dostępu* ⚠️\n\n` +
      `📍 *Lokalizacja:* Główne wejście\n` +
      `⏰ *Czas:* ${new Date().toLocaleString('pl-PL')}\n` +
      `🔢 *Próba:* ${validationAttempts}/${MAX_VALIDATION_ATTEMPTS}\n` +
      `⏳ *Pozostało prób:* ${attemptsLeft}\n` +
      `🌐 *IP:* ${ip}\n\n` +
      `${attemptsLeft === 1 ? '🚨 *OSTATNIA PRÓBA!*' : '⚠️ *Uwaga: Nieprawidłowy kod*'}`
    );

    logger.warn("Door validation", {
      method: req.method,
      url: req.url,
      ip,
      data: { message: "Invalid code entered", attemptNumber: validationAttempts, attemptsLeft }
    });

    io.emit("esp32:validation-response", { success: false });

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

        await sendTelegramNotification(
          `🚪 *DRZWI OTWARTE* 🚪\n\n` +
          `⚠️ *Wymagana weryfikacja kodu!*\n\n` +
          `📍 *Lokalizacja:* Główne wejście\n` +
          `⏰ *Czas:* ${new Date().toLocaleString('pl-PL')}\n` +
          `⏳ *Czas na weryfikację:* ${validationTime / 1000}s\n` +
          `🔐 *Status:* Oczekiwanie na kod\n\n` +
          `🚨 *Natychmiastowa uwaga wymagana!*`
        );

        validationTimer = setTimeout(async () => {
          if (isValidationPending) {
            logger.warn("POST ESP32:door/change-sensor", { method: req.method, url: req.url, data: { message: "Validation failed", isValidationPending } });
            io.emit("esp32:validation-response", { success: false });

            await sendDoorPushNotifications(
              'Timeout weryfikacji',
              'Nie udało się zweryfikować kodu w wyznaczonym czasie! UWAGA: Możliwe zagrożenie bezpieczeństwa!',
              { doorsUnlocked: false, validation: false, timeout: true, alert: true },
              true
            );

            await sendTelegramNotification(
              `🔥 *KRYTYCZNY ALARM BEZPIECZEŃSTWA* 🔥\n\n` +
              `⏰ *TIMEOUT WERYFIKACJI*\n\n` +
              `📍 *Lokalizacja:* Główne wejście\n` +
              `⏰ *Czas:* ${new Date().toLocaleString('pl-PL')}\n` +
              `⏳ *Czas weryfikacji:* ${validationTime / 1000}s\n` +
              `🚨 *Status:* Brak weryfikacji w wyznaczonym czasie\n\n` +
              `⚠️ *MOŻLIWE ZAGROŻENIE BEZPIECZEŃSTWA!*\n`
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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const config = await getDoorConfig();
    res.json(config);
  } catch (error) {
    logger.error('Error getting door validation config', { error: error.message });
    res.status(500).json({ message: "Error fetching configuration" });
  }
});

router.patch("/door/validation-config", authenticateUser, async (req, res) => {
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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

    io.emit("esp32:validation-response", { success: true });

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

// Utility function to validate push tokens
const isValidPushToken = (pushToken, tokenType = 'auto') => {
  if (!pushToken || typeof pushToken !== 'string') {
    return false;
  }

  if (tokenType === 'expo' || (tokenType === 'auto' && Expo.isExpoPushToken(pushToken))) {
    return Expo.isExpoPushToken(pushToken);
  }

  if (tokenType === 'fcm' || (tokenType === 'auto' && !Expo.isExpoPushToken(pushToken))) {
    // FCM tokens are typically longer than 100 characters and contain specific patterns
    return pushToken.length > 100 && /^[a-zA-Z0-9_-]+$/.test(pushToken.replace(/:/g, ''));
  }

  return false;
};

// Door push notification endpoints

router.post("/door/register-push-token", async (req, res) => {
  try {
    const { pushToken, deviceId, tokenType } = req.body;

    // Determine token type if not specified
    let detectedTokenType = tokenType;
    if (!detectedTokenType) {
      if (Expo.isExpoPushToken(pushToken)) {
        detectedTokenType = 'expo';
      } else if (pushToken && pushToken.length > 100) {
        detectedTokenType = 'fcm';
      }
    }

    // Validate token based on environment and type
    if (environment === "production" && detectedTokenType !== 'fcm') {
      console.warn('Production environment expects FCM tokens, received:', detectedTokenType);
    }

    if (!isValidPushToken(pushToken, detectedTokenType)) {
      console.error('Invalid push token format:', pushToken, 'Type:', detectedTokenType);
      return res.status(400).json({
        error: 'Invalid push token',
        expectedType: environment === "production" ? 'fcm' : 'expo',
        receivedType: detectedTokenType
      });
    }

    let doorUser = await DoorUser.findOne({ deviceId });

    if (doorUser) {
      doorUser.pushToken = pushToken;
      doorUser.tokenType = detectedTokenType;
      doorUser.lastActive = new Date();
      await doorUser.save();
    } else {
      doorUser = new DoorUser({
        deviceId,
        pushToken,
        tokenType: detectedTokenType,
        lastActive: new Date()
      });
      await doorUser.save();
    }

    console.log(`Push token registered - Device: ${deviceId}, Type: ${detectedTokenType}, Environment: ${environment}`);
    res.json({
      success: true,
      message: 'Door push token registered',
      tokenType: detectedTokenType,
      environment: environment
    });
  } catch (err) {
    console.error('Error in register-push-token:', err);
    logger.error("POST ESP32:door/register-push-token", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.post("/door/send-notification", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") res.status(401).json({ message: "Not authorized" });

  try {
    const { title, body, data, isCritical } = req.body;

    const tickets = await sendDoorPushNotifications(
      title || 'Door Notification',
      body || 'Test notification',
      data || {},
      isCritical || false
    );

    res.json({ success: true, tickets });
  } catch (err) {
    logger.error("POST ESP32:door/send-notification", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

// TEST ENDPOINT - FCM Testing (Remove in production)
router.post("/door/test-fcm-notification", async (req, res) => {
  try {
    const { title, body, data, isCritical } = req.body;

    console.log('FCM Test Notification Request:', { title, body, data, isCritical });

    const tickets = await sendDoorPushNotifications(
      title || 'FCM Test Notification',
      body || 'This is a test notification from FCM',
      data || { test: true },
      isCritical || false
    );

    logger.info("FCM Test Notification Sent", {
      method: req.method,
      url: req.url,
      data: { title, body, isCritical, ticketCount: tickets?.length || 0 }
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      tickets,
      notificationCount: tickets?.length || 0
    });
  } catch (err) {
    console.error('FCM Test Notification Error:', err);
    logger.error("POST ESP32:door/test-fcm-notification", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: err.message
    });
  }
});

// Notification system status endpoint
router.get("/door/notification-system-status", authenticateUser, async (req, res) => {
  if (res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

  try {
    const doorUsers = await DoorUser.find({});
    const fcmUsers = doorUsers.filter(user => user.tokenType === 'fcm' || (!user.tokenType && !Expo.isExpoPushToken(user.pushToken)));
    const expoUsers = doorUsers.filter(user => user.tokenType === 'expo' || (!user.tokenType && Expo.isExpoPushToken(user.pushToken)));

    res.json({
      success: true,
      environment: environment,
      firebaseConfigured: !!firebaseApp,
      expoConfigured: !!process.env.EXPO_DOOR_ACCESS_TOKEN,
      totalUsers: doorUsers.length,
      fcmUsers: fcmUsers.length,
      expoUsers: expoUsers.length,
      userBreakdown: {
        fcm: fcmUsers.map(user => ({
          deviceId: user.deviceId,
          tokenType: user.tokenType,
          lastActive: user.lastActive
        })),
        expo: expoUsers.map(user => ({
          deviceId: user.deviceId,
          tokenType: user.tokenType,
          lastActive: user.lastActive
        }))
      }
    });
  } catch (err) {
    logger.error("GET ESP32:door/notification-system-status", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

// Additional door user management endpoints

router.get("/door/test-database", authenticateUser, async (req, res) => {
  try {
    const allDoorUsers = await DoorUser.find({});
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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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
  if (!res.authUser || res.authUser.role !== "admin") return res.status(401).json({ message: "Not authorized" });

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

router.post("/door/trigger-alarm", authenticateUser, async (req, res) => {
  try {
    const { eventType, location = "Główne wejście", message, isCritical = true } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: "eventType is required"
      });
    }

    const eventTitles = {
      unauthorized_access: "Nieautoryzowany dostęp",
      forced_entry: "Próba włamania",
      door_left_open: "Drzwi otwarte",
      system_breach: "Naruszenie systemu"
    };

    const title = eventTitles[eventType] || "Alarm bezpieczeństwa";
    const alarmMessage = message || `${title} - ${location}`;

    // Send push notification with alarm flag
    await sendDoorPushNotifications(
      title,
      alarmMessage,
      {
        alarm: true,
        critical: isCritical,
        eventType,
        location,
        timestamp: new Date().toISOString()
      },
      isCritical
    );

    logger.info("Door alarm triggered", {
      eventType,
      location,
      isCritical,
      user: req.user?.username
    });

    res.json({
      success: true,
      message: "Alarm triggered successfully",
      eventType,
      location
    });

  } catch (err) {
    logger.error("POST ESP32:door/trigger-alarm", {
      method: req.method,
      url: req.url,
      error: err.message
    });
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;