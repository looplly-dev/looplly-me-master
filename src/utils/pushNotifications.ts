import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const requestPushPermissions = async () => {
  if (!Capacitor.isNativePlatform()) {
    // Browser push notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Native mobile push notifications
  try {
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    
    if (permStatus.receive !== 'granted') {
      return false;
    }

    await PushNotifications.register();
    return true;
  } catch (error) {
    console.error('Error requesting push permissions:', error);
    return false;
  }
};

export const setupPushNotifications = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Register for push notifications
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    // TODO: Send token to your server
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received: ', notification);
    // Handle foreground notification
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
    // Handle notification tap
  });
};