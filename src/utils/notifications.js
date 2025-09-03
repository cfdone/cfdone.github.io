/**
 * Utility functions for handling browser notifications
 */

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }
  
  try {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return true;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return null;
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, options);
      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  } else if (Notification.permission !== "denied") {
    requestNotificationPermission().then(granted => {
      if (granted) {
        sendNotification(title, options);
      }
    });
  }
  
  return null;
};
