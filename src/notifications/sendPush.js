const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(expoPushToken, title, body) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error('Invalid Expo Push Token:', expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { withSome: 'data' },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Push sent:', ticketChunk);
    }
  } catch (error) {
    console.error('Push send error:', error);
  }
}

module.exports = sendPushNotification;
