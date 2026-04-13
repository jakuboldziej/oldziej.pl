const { Expo } = require('expo-server-sdk');
const User = require('../models/user');
const ChoresUser = require('../models/chores/choresUser');

let expo = new Expo({
  accessToken: process.env.EXPO_CHORES_ACCESS_TOKEN,
  useFcmV1: true
});

const sendPushNotifications = async (userDisplayNames, title, body, data = {}) => {
  try {
    const users = await User.find({ displayName: { $in: userDisplayNames } });
    const userIds = users.map(user => user._id.toString());

    const choresUsers = await ChoresUser.find({
      authUserId: { $in: userIds },
      pushToken: { $ne: null, $exists: true }
    });

    if (choresUsers.length === 0) {
      console.warn('No users with push tokens found');
      return;
    }

    let messages = [];
    for (let choresUser of choresUsers) {
      if (!Expo.isExpoPushToken(choresUser.pushToken)) {
        console.error(`Push token ${choresUser.pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: choresUser.pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        badge: 1,
        priority: 'high',
        ttl: 86400,
        channelId: 'myNotificationChannel',
        categoryId: 'chore_notification',
        android: {
          channelId: 'myNotificationChannel',
          sound: 'default',
          priority: 'max',
          sticky: true,
          vibrate: [0, 250, 250, 250],
          color: '#FF231F7C',
          icon: './assets/icon.png',
          largeIcon: './assets/icon.png',
          style: {
            type: 'bigText',
            text: body
          }
        },
        ios: {
          sound: 'default',
          badge: 1,
          priority: 'high',
          subtitle: 'ChoresApp',
          _displayInForeground: true,
          interruptionLevel: 'active',
          relevanceScore: 1.0
        }
      });
    }

    if (messages.length === 0) {
      console.warn('No valid push tokens to send to');
      return;
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendPushNotifications:', error);
  }
};

module.exports = { sendPushNotifications };