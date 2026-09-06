import * as Calendar from 'expo-calendar';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ScheduleItem } from './firestoreTypes';
import { Platform } from 'react-native';

/**
 * Connects and requests permissions for the device calendar.
 */
export async function connectExternalCalendar(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false; // Web doesn't support native calendar
  }
  
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

/**
 * Syncs events from the device's default calendar to Firestore.
 */
export async function syncExternalEvents(userId: string) {
  if (Platform.OS === 'web') {
    console.warn('[Sync] Cannot sync device calendars on web');
    return;
  }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted');
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  
  // Find primary calendars or default ones (Google, Exchange, etc)
  const syncableCalendars = calendars.filter(c => c.allowsModifications || c.source.type === 'caldav' || c.source.type === 'exchange' || c.source.name.includes('@'));
  const calendarIds = syncableCalendars.map(c => c.id);

  if (calendarIds.length === 0) {
    console.warn('[Sync] No syncable calendars found');
    return;
  }

  // Fetch events for the next 30 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
  
  const col = collection(db, 'schedules');
  let syncedCount = 0;

  for (const event of events) {
    const startDateObj = new Date(event.startDate);
    const endDateObj = new Date(event.endDate);

    const dateStr = startDateObj.toISOString().split('T')[0];
    
    // Format HH:MM
    const startHours = startDateObj.getHours().toString().padStart(2, '0');
    const startMins = startDateObj.getMinutes().toString().padStart(2, '0');
    const startTime = `${startHours}:${startMins}`;

    const endHours = endDateObj.getHours().toString().padStart(2, '0');
    const endMins = endDateObj.getMinutes().toString().padStart(2, '0');
    const endTime = `${endHours}:${endMins}`;

    const scheduleItem: Partial<ScheduleItem> = {
      userId,
      date: dateStr,
      startTime,
      endTime,
      notes: event.notes || '',
      type: 'external',
      externalSource: 'device',
      createdAt: new Date().toISOString(),
    };

    try {
      // Very basic check to avoid exact duplicates (same title and start time)
      const q = query(col, where('userId', '==', userId), where('date', '==', dateStr), where('title', '==', scheduleItem.title));
      const existing = await getDocs(q);
      
      if (existing.empty) {
        await addDoc(col, scheduleItem);
        syncedCount++;
      }
    } catch (e) {
      console.warn(`[Sync] Failed to sync event ${event.title}:`, e);
    }
  }

  console.log(`[Sync] ✅ Successfully synced ${syncedCount} new events from device calendar.`);
  return syncedCount;
}
