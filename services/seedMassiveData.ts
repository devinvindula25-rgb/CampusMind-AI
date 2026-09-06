/**
 * CampusMind AI - Massive Database Seeder
 * Generates extensive mock data for all user types, shared meetings, and the institutional workspace.
 */

import { addDoc, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Isabella', 'William', 'Sophia', 'James',
  'Charlotte', 'Oliver', 'Amelia', 'Benjamin', 'Mia', 'Lucas', 'Harper', 'Mason', 'Evelyn', 'Ethan'
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];
const ROLES = ['lecturer', 'senior_lecturer', 'associate_professor', 'professor', 'senior_professor'] as const;
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Business', 'Law', 'Medicine'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function toYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

function nowISO(): string {
  return new Date().toISOString();
}

function randomName(): string {
  return `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;
}

export async function seedMassiveData() {
  console.log('[Seed] 🚀 Starting massive database seed...');
  const batch = writeBatch(db);

  // 1. Generate 20 Users
  const users: any[] = [];
  const userRefs: any[] = [];
  for (let i = 0; i < 20; i++) {
    const userRef = doc(collection(db, 'users'));
    const role = randomChoice([...ROLES]);
    const dept = randomChoice(DEPARTMENTS);
    const user = {
      uid: userRef.id,
      name: `Prof. ${randomName()}`,
      email: `user${i}@university.edu`,
      role,
      department: dept,
      institution: 'Global Tech University',
      isSeeded: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    batch.set(userRef, user);
    users.push(user);
    userRefs.push(userRef.id);
  }

  // 2. Generate 100 Meetings (Shared among random attendees)
  const meetingTitles = [
    'Curriculum Review Board', 'Department Check-in', 'Research Grant Sync', 'Thesis Defense',
    'Faculty Council', 'Student Welfare Committee', 'Budget Planning', 'AI Tools Workshop'
  ];
  for (let i = 0; i < 100; i++) {
    const hostId = randomChoice(userRefs);
    // 2-5 attendees
    const numAttendees = Math.floor(Math.random() * 4) + 2;
    const attendees = new Set([hostId]);
    while (attendees.size < numAttendees) {
      attendees.add(randomChoice(userRefs));
    }
    const date = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    const meetingRef = doc(collection(db, 'meetings'));
    batch.set(meetingRef, {
      userId: hostId,
      title: randomChoice(meetingTitles),
      date: toYYYYMMDD(date),
      startTime: '10:00',
      endTime: '11:00',
      type: randomChoice(['in_person', 'virtual', 'hybrid']),
      attendees: Array.from(attendees).map(id => users.find(u => u.uid === id)?.name),
      attendeeIds: Array.from(attendees),
      status: date.getTime() > Date.now() ? 'scheduled' : 'completed',
      createdAt: nowISO(),
    });
  }

  // 3. Generate Schedules for each user (Last 30 days to Next 60 days)
  const scheduleTypes = ['lecture_prep', 'research_writing', 'student_consultations', 'assessment_review', 'admin'];
  for (const uid of userRefs) {
    // 20 schedules per user spread randomly
    for (let i = 0; i < 20; i++) {
      const date = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
      const sRef = doc(collection(db, 'schedules'));
      batch.set(sRef, {
        userId: uid,
        date: toYYYYMMDD(date),
        startTime: '09:00',
        endTime: '11:00',
        title: `Task: ${randomChoice(scheduleTypes).replace('_', ' ')}`,
        type: randomChoice(scheduleTypes),
        isAI: Math.random() > 0.5,
        createdAt: nowISO(),
      });
    }
  }

  // 4. Institutional Workspace Data
  const deptId = 'cs-dept';
  
  // Audits
  for (let i = 0; i < 15; i++) {
    const aRef = doc(collection(db, 'audits'));
    batch.set(aRef, {
      departmentId: deptId,
      auditTitle: `Annual ISO ${9000 + i} Audit`,
      auditType: randomChoice(['internal', 'external', 'regulatory']),
      status: randomChoice(['scheduled', 'in_progress', 'completed', 'follow_up_required']),
      date: toYYYYMMDD(randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))),
      auditor: randomName(),
      findings: 'Minor non-conformities found in documentation tracking.',
      nonConformities: Math.floor(Math.random() * 5),
      createdBy: 'system',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  // Accreditations
  for (let i = 0; i < 10; i++) {
    const accRef = doc(collection(db, 'accreditations'));
    batch.set(accRef, {
      departmentId: deptId,
      programmeName: `${randomChoice(['BSc', 'MSc', 'PhD'])} in ${randomChoice(DEPARTMENTS)}`,
      accreditingBody: 'Global Quality Assurance Agency',
      status: randomChoice(['active', 'expiring_soon', 'expired', 'under_review']),
      expiryDate: toYYYYMMDD(randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))),
      complianceScore: 75 + Math.floor(Math.random() * 25),
      createdBy: 'system',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  // Programmes (Curriculum)
  for (let i = 0; i < 12; i++) {
    const pRef = doc(collection(db, 'programmes'));
    batch.set(pRef, {
      departmentId: deptId,
      name: `${randomChoice(['BSc', 'MSc', 'BEng'])} ${randomChoice(DEPARTMENTS)}`,
      code: `PRG-${1000 + i}`,
      faculty: 'Faculty of Science',
      department: 'Computer Science',
      level: randomChoice(['undergraduate', 'postgraduate']),
      accreditationStatus: randomChoice(['accredited', 'pending']),
      reviewStatus: randomChoice(['up_to_date', 'under_review', 'review_due']),
      completionRate: 80 + Math.floor(Math.random() * 15),
      enrolment: 100 + Math.floor(Math.random() * 400),
      satisfaction: 4 + Math.random(),
      createdBy: 'system',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  // Documents
  const docCategories = ['policy', 'procedure', 'template', 'evidence', 'report'];
  for (let i = 0; i < 30; i++) {
    const dRef = doc(collection(db, 'documents'));
    batch.set(dRef, {
      departmentId: deptId,
      title: `QA Document ${i + 1}: ${randomChoice(docCategories).toUpperCase()}`,
      category: randomChoice(docCategories),
      version: `v${Math.floor(Math.random() * 5) + 1}.0`,
      status: randomChoice(['draft', 'active', 'archived', 'under_review']),
      fileSize: `${Math.floor(Math.random() * 500) + 10} KB`,
      createdBy: 'system',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  // Reports
  for (let i = 0; i < 10; i++) {
    const rRef = doc(collection(db, 'reports'));
    batch.set(rRef, {
      departmentId: deptId,
      title: `${2026} Q${Math.floor(Math.random() * 4) + 1} Compliance Report`,
      reportType: randomChoice(['quarterly', 'annual', 'ad_hoc', 'regulatory']),
      status: randomChoice(['draft', 'submitted', 'approved', 'rejected']),
      period: '2026-Q1',
      complianceScore: 80 + Math.floor(Math.random() * 20),
      createdBy: 'system',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  // Commit Batch
  try {
    await batch.commit();
    console.log('[Seed] ✅ Massive data seeded successfully!');
    return true;
  } catch (err) {
    console.error('[Seed] ❌ Failed to commit massive data batch:', err);
    return false;
  }
}
