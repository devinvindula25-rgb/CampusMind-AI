/**
 * CampusMind AI - Firestore Auto-Seeder
 * Populates all collections with realistic demo data on first login.
 * Checks `users/{uid}.isSeeded` flag to avoid re-seeding.
 */

import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { updateUser } from './firestore';

function nowISO(): string {
  return new Date().toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function futureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function pastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function seedCollection(collectionName: string, docs: Record<string, any>[]) {
  const col = collection(db, collectionName);
  for (const docData of docs) {
    try {
      await addDoc(col, docData);
    } catch (e) {
      console.warn(`[Seed] Failed to add doc to ${collectionName}:`, e);
    }
  }
  console.log(`[Seed] ✅ Seeded ${docs.length} docs in "${collectionName}"`);
}

export async function seedAllData(userId: string) {
  console.log('[Seed] 🌱 Starting data seed for user:', userId);
  const departmentId = 'cs-dept';

  try {
    // ── Schedules (today's events) ─────────────────────
    await seedCollection('schedules', [
      { userId, date: todayStr(), startTime: '08:00', endTime: '10:00', title: 'Lecture Prep: CS201 Data Structures', type: 'lecture_prep', isAI: true, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '10:00', endTime: '12:00', title: 'Research Writing: AI Ethics Paper', type: 'research_writing', isAI: true, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '12:00', endTime: '13:00', title: 'Lunch Break', type: 'break', isAI: false, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '13:00', endTime: '14:30', title: 'Student Consultations (Office Hours)', type: 'student_consultations', isAI: true, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '14:30', endTime: '15:30', title: 'Faculty Board Meeting', type: 'meetings', isAI: false, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '16:00', endTime: '17:00', title: 'Assessment Review: CS301 Midterms', type: 'assessment_review', isAI: true, createdAt: nowISO() },
      { userId, date: todayStr(), startTime: '17:00', endTime: '17:30', title: 'Admin: Grade Submissions', type: 'admin', isAI: false, createdAt: nowISO() },
      // Tomorrow
      { userId, date: futureDate(1), startTime: '09:00', endTime: '11:00', title: 'CS301 Lecture: Advanced Algorithms', type: 'lecture_prep', isAI: false, createdAt: nowISO() },
      { userId, date: futureDate(1), startTime: '14:00', endTime: '16:00', title: 'PhD Supervision - Jane Doe', type: 'student_consultations', isAI: false, createdAt: nowISO() },
    ]);

    // ── Meetings ───────────────────────────────────────
    await seedCollection('meetings', [
      { userId, title: 'Faculty Board Meeting', date: todayStr(), startTime: '14:00', endTime: '15:30', type: 'hybrid', room: 'Room 204, Science Building', teamsLink: 'https://teams.microsoft.com/l/meetup-join/...', attendees: ['Dr. Patel', 'Prof. Williams', 'Dr. Chen', '+4 others'], attendeeIds: [], status: 'scheduled', createdAt: nowISO() },
      { userId, title: 'PhD Student Supervision – Jane Doe', date: todayStr(), startTime: '16:00', endTime: '16:45', type: 'in_person', room: 'Office 312', attendees: ['Jane Doe'], attendeeIds: [], status: 'scheduled', createdAt: nowISO() },
      { userId, title: 'Ethics Committee Review', date: futureDate(1), startTime: '10:00', endTime: '11:30', type: 'virtual', teamsLink: 'https://teams.microsoft.com/l/meetup-join/...', attendees: ['Dr. Ahmed', 'Prof. Clark', 'Dr. Bennett'], attendeeIds: [], status: 'scheduled', createdAt: nowISO() },
      { userId, title: 'Department Strategy Meeting', date: futureDate(3), startTime: '09:00', endTime: '10:30', type: 'in_person', room: 'Conference Room A', attendees: ['All CS Department Staff'], attendeeIds: [], status: 'scheduled', createdAt: nowISO() },
      { userId, title: 'Research Collaboration – University of Manchester', date: futureDate(4), startTime: '14:00', endTime: '15:00', type: 'virtual', teamsLink: 'https://teams.microsoft.com/l/meetup-join/...', attendees: ['Dr. Taylor', 'Prof. Green'], attendeeIds: [], status: 'scheduled', createdAt: nowISO() },
    ]);

    // ── Notifications ──────────────────────────────────
    await seedCollection('notifications', [
      { userId, title: 'Critical: ICT Infrastructure Non-Compliance', message: 'Standard QA-5.2 deadline is tomorrow. Evidence documentation is still missing. Immediate action required.', type: 'compliance', priority: 'urgent', read: false, createdAt: nowISO() },
      { userId, title: 'Programme Review Due', message: 'BSc Computer Science annual review is due on August 25, 2026. Please submit the self-evaluation report.', type: 'review', priority: 'high', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { userId, title: 'AI Recommendation Available', message: "New AI analysis suggests redistributing Dr. Chen's committee assignments to balance workload scores.", type: 'ai_recommendation', priority: 'medium', read: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
      { userId, title: 'Accreditation Expiry Warning', message: 'BEng Mechanical Engineering accreditation expires in 45 days. Begin self-evaluation preparation.', type: 'deadline', priority: 'high', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { userId, title: 'Research Report Submitted', message: 'H1 2026 Research Performance Report has been generated and is ready for review.', type: 'system', priority: 'low', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { userId, title: 'New Compliance Assessment', message: 'Quarterly compliance assessment is scheduled for September 1, 2026. All departments should prepare evidence.', type: 'compliance', priority: 'medium', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
    ]);

    // ── Research Projects ──────────────────────────────
    await seedCollection('researchProjects', [
      { userId, title: 'Ethical AI in Higher Education Assessment', status: 'active', publications: 2, conferences: 1, grant: { title: 'UKRI Grant', amount: '£45,000', status: 'awarded' }, ethics: 'approved', predictedDelay: 3, progress: 65, deadline: 'Dec 2026', createdAt: nowISO(), updatedAt: nowISO() },
      { userId, title: 'Machine Learning for Student Retention Prediction', status: 'active', publications: 1, conferences: 2, grant: { title: 'Internal Research Fund', amount: '£8,000', status: 'awarded' }, ethics: 'approved', predictedDelay: 0, progress: 82, deadline: 'Oct 2026', createdAt: nowISO(), updatedAt: nowISO() },
      { userId, title: 'Blockchain-Based Academic Credential Verification', status: 'proposed', publications: 0, conferences: 0, grant: { title: 'Horizon Europe', amount: '€120,000', status: 'applied' }, ethics: 'submitted', predictedDelay: null, progress: 15, deadline: 'Jun 2027', createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Publications ───────────────────────────────────
    await seedCollection('publications', [
      { userId, title: 'A Framework for Ethical AI Assessment in Universities', journal: 'J. of AI in Education', year: 2026, status: 'published', createdAt: nowISO() },
      { userId, title: 'Bias Detection in Automated Grading Systems', journal: 'IEEE Education Conf.', year: 2026, status: 'accepted', createdAt: nowISO() },
      { userId, title: 'Student Performance Prediction using Ensemble Methods', journal: 'Computers & Education', year: 2026, status: 'under_review', createdAt: nowISO() },
    ]);

    // ── Wellness Logs (last 7 days) ────────────────────
    await seedCollection('wellnessLogs', [
      { userId, date: pastDate(4), stressLevel: 3, workingHours: 9.5, meetingsCount: 3, mood: 'okay', createdAt: nowISO() },
      { userId, date: pastDate(3), stressLevel: 2, workingHours: 8.0, meetingsCount: 2, mood: 'good', createdAt: nowISO() },
      { userId, date: pastDate(2), stressLevel: 4, workingHours: 10.0, meetingsCount: 4, mood: 'poor', createdAt: nowISO() },
      { userId, date: pastDate(1), stressLevel: 2, workingHours: 8.5, meetingsCount: 2, mood: 'good', createdAt: nowISO() },
      { userId, date: todayStr(), stressLevel: 2, workingHours: 7.5, meetingsCount: 1, mood: 'great', createdAt: nowISO() },
    ]);

    // ── Accreditation ──────────────────────────────────
    await seedCollection('accreditation', [
      { departmentId, programmeName: 'BSc Computer Science', accreditingBody: 'BCS', status: 'active', expiryDate: futureDate(365), lastReviewDate: pastDate(180), complianceScore: 92, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, programmeName: 'BEng Software Engineering', accreditingBody: 'IET', status: 'expiring_soon', expiryDate: futureDate(45), lastReviewDate: pastDate(300), complianceScore: 78, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Curriculum Reviews ─────────────────────────────
    await seedCollection('curriculumReviews', [
      { departmentId, programmeName: 'BSc Computer Science', reviewType: 'annual', status: 'in_progress', dueDate: futureDate(14), reviewer: 'Dr. Patel', createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, programmeName: 'MSc Data Science', reviewType: 'periodic', status: 'pending', dueDate: futureDate(60), createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Audit Records ──────────────────────────────────
    await seedCollection('auditRecords', [
      { departmentId, auditTitle: 'Q3 Internal Audit – CS Department', auditType: 'internal', status: 'scheduled', date: futureDate(21), auditor: 'Prof. Williams', nonConformities: 0, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Compliance Reports ─────────────────────────────
    await seedCollection('complianceReports', [
      { departmentId, title: 'Q2 2026 Compliance Report', reportType: 'quarterly', status: 'submitted', period: 'Q2 2026', summary: 'Overall compliance at 89%. Minor findings in student feedback mechanisms.', complianceScore: 89, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── QA Documents ───────────────────────────────────
    await seedCollection('qaDocuments', [
      { departmentId, title: 'Quality Assurance Policy 2026', category: 'policy', version: '3.1', status: 'active', tags: ['policy', 'QA', 'governance'], createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, title: 'Programme Approval Template', category: 'template', version: '2.0', status: 'active', tags: ['template', 'programme'], createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Academic Programmes ────────────────────────────
    await seedCollection('academicProgrammes', [
      { departmentId, name: 'BSc Computer Science', code: 'CS-001', faculty: 'Faculty of Computing', department: 'Computer Science', level: 'undergraduate', accreditationStatus: 'accredited', reviewStatus: 'up_to_date', completionRate: 94, enrolment: 320, satisfaction: 4.2, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, name: 'MSc Data Science', code: 'DS-002', faculty: 'Faculty of Computing', department: 'Information Technology', level: 'postgraduate', accreditationStatus: 'pending', reviewStatus: 'under_review', completionRate: 87, enrolment: 85, satisfaction: 3.8, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, name: 'BEng Mechanical Engineering', code: 'ME-003', faculty: 'Faculty of Engineering', department: 'Engineering', level: 'undergraduate', accreditationStatus: 'accredited', reviewStatus: 'review_due', completionRate: 91, enrolment: 210, satisfaction: 4.0, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, name: 'PhD Artificial Intelligence', code: 'AI-004', faculty: 'Faculty of Computing', department: 'Computer Science', level: 'doctoral', accreditationStatus: 'accredited', reviewStatus: 'up_to_date', completionRate: 78, enrolment: 22, satisfaction: 4.5, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
      { departmentId, name: 'MBA Business Administration', code: 'BA-005', faculty: 'Faculty of Business', department: 'Business Administration', level: 'postgraduate', accreditationStatus: 'expired', reviewStatus: 'overdue', completionRate: 82, enrolment: 150, satisfaction: 3.6, createdBy: userId, createdAt: nowISO(), updatedAt: nowISO() },
    ]);

    // ── Email Drafts ───────────────────────────────────
    await seedCollection('emailDrafts', [
      { userId, subject: 'Request for Extension – CS201 Assignment', body: 'Draft regarding extension request from John Smith...', recipient: 'john.smith@university.edu', context: 'student_inquiry', status: 'draft', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { userId, subject: 'Curriculum Review Meeting Agenda', body: 'Draft agenda for the curriculum meeting...', recipient: 'dr.patel@university.edu', context: 'committee', status: 'draft', createdAt: new Date(Date.now() - 14400000).toISOString() },
    ]);

    // Mark user as seeded
    await updateUser(userId, { isSeeded: true });
    console.log('[Seed] ✅ All data seeded successfully!');
    return true;
  } catch (e) {
    console.error('[Seed] ❌ Seeding failed:', e);
    return false;
  }
}
