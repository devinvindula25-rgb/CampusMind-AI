/**
 * CampusMind AI - Local Notifications Service
 * Uses expo-notifications for client-side scheduled notifications.
 * (No Cloud Functions needed — works on Spark/free Firebase plan)
 *
 * SETUP:
 * Run: npx expo install expo-notifications expo-device
 */

import { Platform } from 'react-native';

// Lazy import to prevent crashes if not installed yet
let Notifications: any = null;
let Device: any = null;

async function loadModules() {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
  } catch {
    console.warn('[Notifications] expo-notifications not installed. Run: npx expo install expo-notifications expo-device');
  }
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  await loadModules();
  if (!Notifications) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CampusMind AI',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B4D8',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification({
  title,
  body,
  triggerSeconds,
  data,
}: {
  title: string;
  body: string;
  triggerSeconds: number;
  data?: Record<string, any>;
}): Promise<string | null> {
  await loadModules();
  if (!Notifications) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: 'timeInterval',
        seconds: triggerSeconds,
        repeats: false,
      },
    });
    return id;
  } catch (e) {
    console.warn('[Notifications] Schedule error:', e);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string) {
  await loadModules();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await loadModules();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Pre-built notification helpers ──────────────────────────

/**
 * Schedule a meeting reminder (30 min before)
 */
export async function scheduleMeetingReminder(
  meetingTitle: string,
  meetingTime: Date,
) {
  const now = Date.now();
  const reminderTime = meetingTime.getTime() - 30 * 60 * 1000; // 30 min before
  const secondsUntil = Math.max(1, Math.floor((reminderTime - now) / 1000));

  return scheduleNotification({
    title: '📅 Meeting in 30 minutes',
    body: meetingTitle,
    triggerSeconds: secondsUntil,
    data: { type: 'meeting_reminder' },
  });
}

/**
 * Schedule a deadline reminder (24h before)
 */
export async function scheduleDeadlineReminder(
  taskTitle: string,
  deadline: Date,
) {
  const now = Date.now();
  const reminderTime = deadline.getTime() - 24 * 60 * 60 * 1000; // 24h before
  const secondsUntil = Math.max(1, Math.floor((reminderTime - now) / 1000));

  return scheduleNotification({
    title: '⏰ Deadline Tomorrow',
    body: `${taskTitle} is due tomorrow. Make sure to finalize.`,
    triggerSeconds: secondsUntil,
    data: { type: 'deadline_reminder' },
  });
}

/**
 * Schedule a burnout alert
 */
export async function scheduleBurnoutAlert(score: number) {
  if (score > 75) {
    return scheduleNotification({
      title: '❤️ Well-being Alert',
      body: `Your burnout risk score is ${score}/100. Consider taking a break or reducing your workload.`,
      triggerSeconds: 5, // Show almost immediately
      data: { type: 'burnout_alert', score },
    });
  }
  return null;
}

/**
 * Schedule ergonomic reminders for Focus Mode (20-20-20 rule)
 */
export async function scheduleErgonomicReminders(intervalMinutes: number = 20) {
  const reminders = [
    { title: '👀 20-20-20 Rule', body: 'Look at something 20 feet away for 20 seconds.', offset: 1 },
    { title: '🧘 Stretch Break', body: 'Stand up and stretch your body for a minute!', offset: 2.25 },
    { title: '💧 Hydration Check', body: 'Time for a glass of water!', offset: 3 },
  ];

  const ids: string[] = [];
  for (const reminder of reminders) {
    const id = await scheduleNotification({
      title: reminder.title,
      body: reminder.body,
      triggerSeconds: Math.round(intervalMinutes * reminder.offset * 60),
      data: { type: 'ergonomic' },
    });
    if (id) ids.push(id);
  }
  return ids;
}
