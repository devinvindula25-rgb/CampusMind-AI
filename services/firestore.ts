/**
 * CampusMind AI - Firestore Service Layer
 * Complete CRUD operations for all 13 collections.
 * Uses real-time listeners (onSnapshot) for live data updates.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  UserProfile,
  ScheduleItem,
  Meeting,
  Notification,
  ResearchProject,
  Publication,
  WellnessLog,
  EmailDraft,
  ConferenceEvent,
  TeachingCourse,
  CommitteeMembership,
  SupervisionRecord,
  AccreditationRecord,
  CurriculumReview,
  AuditRecord,
  ComplianceReport,
  QADocument,
  AcademicProgramme,
} from './firestoreTypes';

// ─── Helpers ──────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Users ────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null;
  } catch (e) {
    console.warn('[Firestore] getUser error:', e);
    return null;
  }
}

export async function createUser(uid: string, data: Partial<UserProfile>) {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  } catch (e) {
    console.warn('[Firestore] createUser error:', e);
  }
}

export async function updateUser(uid: string, data: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateUser error:', e);
  }
}

// ─── Schedules (Planner) ──────────────────────────────────────

export function subscribeSchedules(
  userId: string,
  dateStr: string,
  callback: (items: ScheduleItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'schedules'),
    where('userId', '==', userId),
    where('date', '==', dateStr),
  );
  return onSnapshot(q, (snap) => {
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleItem));
    const seen = new Set<string>();
    items = items.filter(d => {
      const key = `${d.title}-${d.startTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    items.sort((a, b) => a.startTime.localeCompare(b.startTime));
    callback(items);
  }, (err) => {
    console.warn('[Firestore] subscribeSchedules error:', err);
    callback([]);
  });
}

export function subscribeSchedulesRange(
  userId: string,
  startDateStr: string,
  endDateStr: string,
  callback: (items: ScheduleItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'schedules'),
    where('userId', '==', userId),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr)
  );
  return onSnapshot(q, (snap) => {
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleItem));
    const seen = new Set<string>();
    items = items.filter(d => {
      const key = `${d.date}-${d.title}-${d.startTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    items.sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    });
    callback(items);
  }, (err) => {
    console.warn('[Firestore] subscribeSchedulesRange error:', err);
    callback([]);
  });
}

export async function createSchedule(userId: string, data: Omit<ScheduleItem, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'schedules'), {
      ...data,
      userId,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createSchedule error:', e);
    return null;
  }
}

export async function updateSchedule(scheduleId: string, data: Partial<ScheduleItem>) {
  try {
    await updateDoc(doc(db, 'schedules', scheduleId), data);
  } catch (e) {
    console.warn('[Firestore] updateSchedule error:', e);
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    await deleteDoc(doc(db, 'schedules', scheduleId));
  } catch (e) {
    console.warn('[Firestore] deleteSchedule error:', e);
  }
}

export async function syncOrphanMeetings(userId: string) {
  try {
    const q = query(collection(db, 'schedules'), where('userId', '==', userId), where('type', '==', 'meetings'));
    const snap = await getDocs(q);
    const orphans = snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleItem)).filter(s => !s.meetingId);
    
    for (const orphan of orphans) {
      const newMeeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: orphan.userId,
        title: orphan.title,
        date: orphan.date,
        startTime: orphan.startTime,
        endTime: orphan.endTime,
        type: 'in_person',
        status: 'scheduled',
        attendees: [],
        notes: orphan.notes || '',
      };
      const meetingRef = await addDoc(collection(db, 'meetings'), {
        ...newMeeting,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
      if (meetingRef.id && orphan.id) {
        await updateDoc(doc(db, 'schedules', orphan.id), { meetingId: meetingRef.id });
      }
    }
  } catch (e) {
    console.warn('[Firestore] syncOrphanMeetings error:', e);
  }
}

// ─── Meetings ─────────────────────────────────────────────────

export function subscribeMeetings(
  userId: string,
  callback: (meetings: Meeting[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'meetings'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Meeting));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    callback(data.slice(0, 30));
  }, (err) => {
    console.warn('[Firestore] subscribeMeetings error:', err);
    callback([]);
  });
}

export async function createMeeting(userId: string, data: Omit<Meeting, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'meetings'), {
      ...data,
      userId,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createMeeting error:', e);
    return null;
  }
}

export async function updateMeeting(meetingId: string, data: Partial<Meeting>) {
  try {
    await updateDoc(doc(db, 'meetings', meetingId), data);
  } catch (e) {
    console.warn('[Firestore] updateMeeting error:', e);
  }
}

export async function deleteMeeting(meetingId: string) {
  try {
    await deleteDoc(doc(db, 'meetings', meetingId));
  } catch (e) {
    console.warn('[Firestore] deleteMeeting error:', e);
  }
}

// ─── Notifications ────────────────────────────────────────────

export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    limit(50),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
    const seen = new Set<string>();
    data = data.filter(d => {
      const key = `${d.title}-${d.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeNotifications error:', err);
    callback([]);
  });
}

export async function createNotification(userId: string, data: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'notifications'), {
      ...data,
      userId,
      read: false,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createNotification error:', e);
    return null;
  }
}

export async function markNotificationRead(notifId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (e) {
    console.warn('[Firestore] markNotificationRead error:', e);
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (e) {
    console.warn('[Firestore] markAllNotificationsRead error:', e);
  }
}

export async function deleteNotification(notifId: string) {
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (e) {
    console.warn('[Firestore] deleteNotification error:', e);
  }
}

// ─── Research Projects ────────────────────────────────────────

export function subscribeResearchProjects(
  userId: string,
  callback: (projects: ResearchProject[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'researchProjects'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ResearchProject));
    
    // Deduplicate by title to avoid seeing duplicate entries
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });

    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeResearchProjects error:', err);
    callback([]);
  });
}

export async function createResearchProject(userId: string, data: Omit<ResearchProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'researchProjects'), {
      ...data,
      userId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createResearchProject error:', e);
    return null;
  }
}

export async function updateResearchProject(projectId: string, data: Partial<ResearchProject>) {
  try {
    await updateDoc(doc(db, 'researchProjects', projectId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateResearchProject error:', e);
  }
}

export async function deleteResearchProject(projectId: string) {
  try {
    await deleteDoc(doc(db, 'researchProjects', projectId));
  } catch (e) {
    console.warn('[Firestore] deleteResearchProject error:', e);
  }
}

// ─── Publications ─────────────────────────────────────────────

export function subscribePublications(
  userId: string,
  callback: (pubs: Publication[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'publications'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Publication));
    
    // Deduplicate by title
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });

    data.sort((a, b) => (b.year || 0) - (a.year || 0));
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribePublications error:', err);
    callback([]);
  });
}

export async function createPublication(userId: string, data: Omit<Publication, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'publications'), {
      ...data,
      userId,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createPublication error:', e);
    return null;
  }
}

export async function updatePublication(pubId: string, data: Partial<Publication>) {
  try {
    await updateDoc(doc(db, 'publications', pubId), data);
  } catch (e) {
    console.warn('[Firestore] updatePublication error:', e);
  }
}

export async function deletePublication(pubId: string) {
  try {
    await deleteDoc(doc(db, 'publications', pubId));
  } catch (e) {
    console.warn('[Firestore] deletePublication error:', e);
  }
}

// ─── Wellness / Burnout Logs ──────────────────────────────────

export function subscribeWellnessLogs(
  userId: string,
  callback: (logs: WellnessLog[]) => void,
  limitCount: number = 30,
): Unsubscribe {
  const q = query(
    collection(db, 'wellnessLogs'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WellnessLog));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.date)) return false;
      seen.add(d.date);
      return true;
    });
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data.slice(0, limitCount));
  }, (err) => {
    console.warn('[Firestore] subscribeWellnessLogs error:', err);
    callback([]);
  });
}

export async function createWellnessLog(userId: string, data: Omit<WellnessLog, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'wellnessLogs'), {
      ...data,
      userId,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createWellnessLog error:', e);
    return null;
  }
}

export async function updateWellnessLog(logId: string, data: Partial<WellnessLog>) {
  try {
    await updateDoc(doc(db, 'wellnessLogs', logId), data);
  } catch (e) {
    console.warn('[Firestore] updateWellnessLog error:', e);
  }
}

export async function deleteWellnessLog(logId: string) {
  try {
    await deleteDoc(doc(db, 'wellnessLogs', logId));
  } catch (e) {
    console.warn('[Firestore] deleteWellnessLog error:', e);
  }
}

// ─── Email Drafts ─────────────────────────────────────────────

export function subscribeEmailDrafts(
  userId: string,
  callback: (drafts: EmailDraft[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'emailDrafts'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailDraft));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.subject)) return false;
      seen.add(d.subject);
      return true;
    });
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data.slice(0, 20));
  }, (err) => {
    console.warn('[Firestore] subscribeEmailDrafts error:', err);
    callback([]);
  });
}

export async function createEmailDraft(userId: string, data: Omit<EmailDraft, 'id' | 'userId' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'emailDrafts'), {
      ...data,
      userId,
      createdAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createEmailDraft error:', e);
    return null;
  }
}

export async function updateEmailDraft(draftId: string, data: Partial<EmailDraft>) {
  try {
    await updateDoc(doc(db, 'emailDrafts', draftId), data);
  } catch (e) {
    console.warn('[Firestore] updateEmailDraft error:', e);
  }
}

export async function deleteEmailDraft(draftId: string) {
  try {
    await deleteDoc(doc(db, 'emailDrafts', draftId));
  } catch (e) {
    console.warn('[Firestore] deleteEmailDraft error:', e);
  }
}

// ─── Accreditation Records ────────────────────────────────────

export function subscribeAccreditation(
  departmentId: string,
  callback: (records: AccreditationRecord[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'accreditation'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccreditationRecord));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.programmeName)) return false;
      seen.add(d.programmeName);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeAccreditation error:', err);
    callback([]);
  });
}

export async function createAccreditationRecord(data: Omit<AccreditationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'accreditation'), {
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createAccreditationRecord error:', e);
    return null;
  }
}

export async function updateAccreditationRecord(recordId: string, data: Partial<AccreditationRecord>) {
  try {
    await updateDoc(doc(db, 'accreditation', recordId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateAccreditationRecord error:', e);
  }
}

export async function deleteAccreditationRecord(recordId: string) {
  try {
    await deleteDoc(doc(db, 'accreditation', recordId));
  } catch (e) {
    console.warn('[Firestore] deleteAccreditationRecord error:', e);
  }
}

// ─── Curriculum Reviews ───────────────────────────────────────

export function subscribeCurriculumReviews(
  departmentId: string,
  callback: (reviews: CurriculumReview[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'curriculumReviews'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CurriculumReview));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.programmeName)) return false;
      seen.add(d.programmeName);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeCurriculumReviews error:', err);
    callback([]);
  });
}

export async function createCurriculumReview(data: Omit<CurriculumReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'curriculumReviews'), {
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createCurriculumReview error:', e);
    return null;
  }
}

export async function updateCurriculumReview(reviewId: string, data: Partial<CurriculumReview>) {
  try {
    await updateDoc(doc(db, 'curriculumReviews', reviewId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateCurriculumReview error:', e);
  }
}

export async function deleteCurriculumReview(reviewId: string) {
  try {
    await deleteDoc(doc(db, 'curriculumReviews', reviewId));
  } catch (e) {
    console.warn('[Firestore] deleteCurriculumReview error:', e);
  }
}

// ─── Audit Records ────────────────────────────────────────────

export function subscribeAuditRecords(
  departmentId: string,
  callback: (records: AuditRecord[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'auditRecords'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditRecord));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.auditTitle)) return false;
      seen.add(d.auditTitle);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeAuditRecords error:', err);
    callback([]);
  });
}

export async function createAuditRecord(data: Omit<AuditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'auditRecords'), {
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createAuditRecord error:', e);
    return null;
  }
}

export async function updateAuditRecord(recordId: string, data: Partial<AuditRecord>) {
  try {
    await updateDoc(doc(db, 'auditRecords', recordId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateAuditRecord error:', e);
  }
}

export async function deleteAuditRecord(recordId: string) {
  try {
    await deleteDoc(doc(db, 'auditRecords', recordId));
  } catch (e) {
    console.warn('[Firestore] deleteAuditRecord error:', e);
  }
}

// ─── Compliance Reports ───────────────────────────────────────

export function subscribeComplianceReports(
  departmentId: string,
  callback: (reports: ComplianceReport[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'complianceReports'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ComplianceReport));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeComplianceReports error:', err);
    callback([]);
  });
}

export async function createComplianceReport(departmentId: string, data: Omit<ComplianceReport, 'id' | 'departmentId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'complianceReports'), {
      ...data,
      departmentId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createComplianceReport error:', e);
    return null;
  }
}

export async function updateComplianceReport(reportId: string, data: Partial<ComplianceReport>) {
  try {
    await updateDoc(doc(db, 'complianceReports', reportId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateComplianceReport error:', e);
  }
}

export async function deleteComplianceReport(reportId: string) {
  try {
    await deleteDoc(doc(db, 'complianceReports', reportId));
  } catch (e) {
    console.warn('[Firestore] deleteComplianceReport error:', e);
  }
}

// ─── QA Documents ─────────────────────────────────────────────

export function subscribeQADocuments(
  departmentId: string,
  callback: (docs: QADocument[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'qaDocuments'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QADocument));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeQADocuments error:', err);
    callback([]);
  });
}

export async function createQADocument(data: Omit<QADocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'qaDocuments'), {
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createQADocument error:', e);
    return null;
  }
}

export async function updateQADocument(docId: string, data: Partial<QADocument>) {
  try {
    await updateDoc(doc(db, 'qaDocuments', docId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateQADocument error:', e);
  }
}

export async function deleteQADocument(docId: string) {
  try {
    await deleteDoc(doc(db, 'qaDocuments', docId));
  } catch (e) {
    console.warn('[Firestore] deleteQADocument error:', e);
  }
}

// ─── Academic Programmes ───────────────────────────────────────

export function subscribeProgrammes(
  departmentId: string,
  callback: (programmes: AcademicProgramme[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'academicProgrammes'),
    where('departmentId', '==', departmentId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AcademicProgramme));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.name)) return false;
      seen.add(d.name);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeProgrammes error:', err);
    callback([]);
  });
}

export async function createProgramme(data: Omit<AcademicProgramme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'academicProgrammes'), {
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createProgramme error:', e);
    return null;
  }
}

export async function updateProgramme(progId: string, data: Partial<AcademicProgramme>) {
  try {
    await updateDoc(doc(db, 'academicProgrammes', progId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateProgramme error:', e);
  }
}

export async function deleteProgramme(progId: string) {
  try {
    await deleteDoc(doc(db, 'academicProgrammes', progId));
  } catch (e) {
    console.warn('[Firestore] deleteProgramme error:', e);
  }
}

// ─── Conference Events ────────────────────────────────────────

export function subscribeConferenceEvents(
  userId: string,
  callback: (events: ConferenceEvent[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'conferenceEvents'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConferenceEvent));
    
    // Deduplicate by title
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.title)) return false;
      seen.add(d.title);
      return true;
    });

    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeConferenceEvents error:', err);
    callback([]);
  });
}

export async function createConferenceEvent(userId: string, data: Omit<ConferenceEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'conferenceEvents'), {
      ...data,
      userId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createConferenceEvent error:', e);
    return null;
  }
}

export async function updateConferenceEvent(eventId: string, data: Partial<ConferenceEvent>) {
  try {
    await updateDoc(doc(db, 'conferenceEvents', eventId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateConferenceEvent error:', e);
  }
}

export async function deleteConferenceEvent(eventId: string) {
  try {
    await deleteDoc(doc(db, 'conferenceEvents', eventId));
  } catch (e) {
    console.warn('[Firestore] deleteConferenceEvent error:', e);
  }
}

// ─── Teaching Courses ─────────────────────────────────────────

export function subscribeTeachingCourses(
  userId: string,
  callback: (courses: TeachingCourse[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'teachingCourses'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeachingCourse));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.courseName)) return false;
      seen.add(d.courseName);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeTeachingCourses error:', err);
    callback([]);
  });
}

export async function createTeachingCourse(userId: string, data: Omit<TeachingCourse, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'teachingCourses'), {
      ...data,
      userId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createTeachingCourse error:', e);
    return null;
  }
}

export async function updateTeachingCourse(courseId: string, data: Partial<TeachingCourse>) {
  try {
    await updateDoc(doc(db, 'teachingCourses', courseId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateTeachingCourse error:', e);
  }
}

export async function deleteTeachingCourse(courseId: string) {
  try {
    await deleteDoc(doc(db, 'teachingCourses', courseId));
  } catch (e) {
    console.warn('[Firestore] deleteTeachingCourse error:', e);
  }
}

// ─── Committee Memberships ────────────────────────────────────

export function subscribeCommittees(
  userId: string,
  callback: (memberships: CommitteeMembership[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'committeeMemberships'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommitteeMembership));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.committeeName)) return false;
      seen.add(d.committeeName);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeCommittees error:', err);
    callback([]);
  });
}

export async function createCommittee(userId: string, data: Omit<CommitteeMembership, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'committeeMemberships'), {
      ...data,
      userId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createCommittee error:', e);
    return null;
  }
}

export async function updateCommittee(membershipId: string, data: Partial<CommitteeMembership>) {
  try {
    await updateDoc(doc(db, 'committeeMemberships', membershipId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateCommittee error:', e);
  }
}

export async function deleteCommittee(membershipId: string) {
  try {
    await deleteDoc(doc(db, 'committeeMemberships', membershipId));
  } catch (e) {
    console.warn('[Firestore] deleteCommittee error:', e);
  }
}

// ─── Supervision Records ──────────────────────────────────────

export function subscribeSupervisions(
  userId: string,
  callback: (records: SupervisionRecord[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'supervisionRecords'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, (snap) => {
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupervisionRecord));
    const seen = new Set<string>();
    data = data.filter(d => {
      if (seen.has(d.studentName)) return false;
      seen.add(d.studentName);
      return true;
    });
    callback(data);
  }, (err) => {
    console.warn('[Firestore] subscribeSupervisions error:', err);
    callback([]);
  });
}

export async function createSupervision(userId: string, data: Omit<SupervisionRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'supervisionRecords'), {
      ...data,
      userId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return ref.id;
  } catch (e) {
    console.warn('[Firestore] createSupervision error:', e);
    return null;
  }
}

export async function updateSupervision(recordId: string, data: Partial<SupervisionRecord>) {
  try {
    await updateDoc(doc(db, 'supervisionRecords', recordId), { ...data, updatedAt: nowISO() });
  } catch (e) {
    console.warn('[Firestore] updateSupervision error:', e);
  }
}

export async function deleteSupervision(recordId: string) {
  try {
    await deleteDoc(doc(db, 'supervisionRecords', recordId));
  } catch (e) {
    console.warn('[Firestore] deleteSupervision error:', e);
  }
}

// ─── Institutional Activities ─────────────────────────────────

export const subscribeInstitutionalActivities = (
  departmentId: string,
  callback: (data: any[]) => void,
  limitCount: number = 10
) => {
  const q = query(
    collection(db, 'institutional_activities'),
    where('departmentId', '==', departmentId)
  );
  return onSnapshot(q, (snapshot) => {
    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    docs.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
    if (limitCount) {
      docs = docs.slice(0, limitCount);
    }
    callback(docs);
  });
};

// ==========================================
// AUDIT CHECKLIST
// ==========================================
export function subscribeAuditChecklist(departmentId: string, callback: (items: any[]) => void) {
  const q = query(
    collection(db, 'auditChecklist'),
    where('departmentId', '==', departmentId)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  }, (err) => {
    console.warn('[Firestore] subscribeAuditChecklist error:', err);
    callback([]);
  });
}

export async function updateAuditChecklistItem(itemId: string, data: Partial<any>) {
  try {
    const ref = doc(db, 'auditChecklist', itemId);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[Firestore] updateAuditChecklistItem error:', e);
    throw e;
  }
}
