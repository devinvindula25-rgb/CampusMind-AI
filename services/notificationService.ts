// Mock Notification Service for Expo Go
// Note: expo-notifications was removed from Expo Go in SDK 53. To use actual native
// notifications, you must use a Custom Development Build (expo prebuild).
// For now, we mock the scheduling logic so the settings still function correctly in memory.

export async function registerForPushNotificationsAsync() {
  console.log('[NotificationService] Mock: Requested push permissions.');
  return true;
}

export async function configureScheduledNotifications(settings: {
  notificationsEnabled: boolean;
  ergonomicReminders: boolean;
  hydrationReminders: boolean;
  deadlineReminders: boolean;
  burnoutAlerts: boolean;
  meetingReminders: boolean;
  reminderInterval: number;
}) {
  console.log('[NotificationService] Mock: Cancelled all scheduled notifications.');

  if (!settings.notificationsEnabled) {
    return;
  }

  if (settings.hydrationReminders) {
    console.log('[NotificationService] Mock: Scheduled Hydration Reminder (Every 2 hours).');
  }

  if (settings.ergonomicReminders) {
    console.log(`[NotificationService] Mock: Scheduled Ergonomic Break (Every ${settings.reminderInterval} minutes).`);
  }

  if (settings.deadlineReminders) {
    console.log('[NotificationService] Mock: Scheduled Daily Deadline Check (9:00 AM).');
  }
}
