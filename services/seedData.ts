/**
 * CampusMind AI - Seed Data for New Collections
 * Creates sample data for Teaching, Committees, Supervision, and Conferences.
 */

import {
  createTeachingCourse,
  createCommittee,
  createSupervision,
  createConferenceEvent,
} from './firestore';
import { getMockSessionsForCourse, getMockAssessmentsForCourse } from './mockCourseData';

export async function seedNewCollections(userId: string) {
  console.log('[Seed] Seeding new collections for user:', userId);

  // ─── Teaching Courses ──────────────────────────────────────
  await createTeachingCourse(userId, {
    courseName: 'Introduction to Algorithms',
    moduleCode: 'CS201',
    semester: '2026 S2',
    contactHours: 48,
    lectures: 32,
    tutorials: 10,
    practicals: 6,
    sessions: getMockSessionsForCourse('CS201'),
    assessments: getMockAssessmentsForCourse('CS201'),
    studentFeedback: [
      { rating: 4.5, comment: 'Excellent teaching style, very clear explanations.', date: '2026-06-15' },
      { rating: 4.0, comment: 'Good pace, but practicals could be longer.', date: '2026-06-15' },
    ],
    averageRating: 4.25,
    status: 'active',
  });

  await createTeachingCourse(userId, {
    courseName: 'Database Systems',
    moduleCode: 'CS305',
    semester: '2026 S2',
    contactHours: 42,
    lectures: 28,
    tutorials: 8,
    practicals: 6,
    sessions: getMockSessionsForCourse('CS305'),
    assessments: getMockAssessmentsForCourse('CS305'),
    studentFeedback: [
      { rating: 4.8, comment: 'Best lecturer in the department!', date: '2026-06-10' },
      { rating: 3.5, comment: 'Need more practical SQL exercises.', date: '2026-06-10' },
    ],
    averageRating: 4.15,
    status: 'active',
  });

  await createTeachingCourse(userId, {
    courseName: 'Software Engineering',
    moduleCode: 'CS401',
    semester: '2026 S1',
    contactHours: 40,
    lectures: 26,
    tutorials: 8,
    practicals: 6,
    sessions: getMockSessionsForCourse('CS401'),
    assessments: getMockAssessmentsForCourse('CS401'),
    studentFeedback: [
      { rating: 4.7, comment: 'The group project was challenging but rewarding.', date: '2026-06-20' },
    ],
    averageRating: 4.7,
    status: 'completed',
  });

  // ─── Committee Memberships ─────────────────────────────────
  await createCommittee(userId, {
    committeeName: 'Board of Study — Computer Science',
    committeeType: 'board_of_study',
    role: 'member',
    startDate: '2025-01-15',
    meetingsAttended: 8,
    totalMeetings: 10,
    status: 'active',
    notes: 'Curriculum review responsibilities',
  });

  await createCommittee(userId, {
    committeeName: 'Ethics Review Committee',
    committeeType: 'ethics_review',
    role: 'secretary',
    startDate: '2024-06-01',
    meetingsAttended: 14,
    totalMeetings: 16,
    status: 'active',
    notes: 'Reviewing research ethics applications',
  });

  await createCommittee(userId, {
    committeeName: 'Internal Quality Assurance Cell',
    committeeType: 'iqac',
    role: 'member',
    startDate: '2025-03-01',
    meetingsAttended: 5,
    totalMeetings: 6,
    status: 'active',
  });

  await createCommittee(userId, {
    committeeName: 'Examination Board — Faculty of Science',
    committeeType: 'examination_board',
    role: 'chair',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    meetingsAttended: 12,
    totalMeetings: 12,
    status: 'completed',
  });

  // ─── Supervision Records ───────────────────────────────────
  await createSupervision(userId, {
    studentName: 'Amal Perera',
    studentLevel: 'postgraduate',
    role: 'supervisor',
    thesisTitle: 'Deep Learning Approaches for Sinhala NLP',
    researchProposal: 'approved',
    ethicsApproval: 'approved',
    meetingsCount: 18,
    progressReports: 4,
    milestones: [
      { title: 'Literature Review', dueDate: '2025-06-01', status: 'completed' },
      { title: 'Data Collection', dueDate: '2025-12-01', status: 'completed' },
      { title: 'Model Development', dueDate: '2026-06-01', status: 'completed' },
      { title: 'Thesis Writing', dueDate: '2026-10-01', status: 'pending' },
      { title: 'Submission', dueDate: '2026-12-01', status: 'pending' },
    ],
    thesisSubmission: 'drafting',
    publications: [],
    vivaDate: '2027-01-15',
    vivaStatus: 'not_scheduled',
    status: 'active',
  });

  await createSupervision(userId, {
    studentName: 'Nimesha Fernando',
    studentLevel: 'postgraduate',
    role: 'co_supervisor',
    thesisTitle: 'Blockchain-based Academic Credential Verification',
    researchProposal: 'approved',
    ethicsApproval: 'submitted',
    meetingsCount: 10,
    progressReports: 2,
    milestones: [
      { title: 'Literature Review', dueDate: '2026-03-01', status: 'completed' },
      { title: 'System Design', dueDate: '2026-07-01', status: 'completed' },
      { title: 'Implementation', dueDate: '2026-12-01', status: 'pending' },
      { title: 'Testing & Evaluation', dueDate: '2027-03-01', status: 'pending' },
    ],
    thesisSubmission: 'not_started',
    publications: [],
    status: 'active',
  });

  await createSupervision(userId, {
    studentName: 'Kavinda Silva',
    studentLevel: 'undergraduate',
    role: 'supervisor',
    thesisTitle: 'IoT-based Smart Campus Energy Management',
    researchProposal: 'submitted',
    ethicsApproval: 'not_submitted',
    meetingsCount: 6,
    progressReports: 1,
    milestones: [
      { title: 'Proposal Defense', dueDate: '2026-09-15', status: 'pending' },
      { title: 'Prototype Development', dueDate: '2026-11-01', status: 'pending' },
      { title: 'Final Report', dueDate: '2027-02-01', status: 'pending' },
    ],
    thesisSubmission: 'not_started',
    publications: [],
    status: 'active',
  });

  // ─── Conference Events ─────────────────────────────────────
  await createConferenceEvent(userId, {
    title: 'IEEE International Conference on AI & ML',
    eventType: 'international_conference',
    location: 'Singapore',
    date: '2026-11-15',
    endDate: '2026-11-18',
    status: 'upcoming',
    role: 'presenter',
    paperTitle: 'Federated Learning for Resource-Constrained Devices',
  });

  await createConferenceEvent(userId, {
    title: 'National Computing Conference 2026',
    eventType: 'national_conference',
    location: 'Colombo, Sri Lanka',
    date: '2026-10-05',
    endDate: '2026-10-06',
    status: 'upcoming',
    role: 'panelist',
  });

  await createConferenceEvent(userId, {
    title: 'ACM SIGMOD Research Symposium',
    eventType: 'research_symposium',
    location: 'Virtual',
    date: '2026-07-20',
    endDate: '2026-07-22',
    status: 'attended',
    role: 'attendee',
  });

  await createConferenceEvent(userId, {
    title: 'Grant Writing Workshop — NRC',
    eventType: 'grant_writing_workshop',
    location: 'Kandy, Sri Lanka',
    date: '2026-09-10',
    status: 'upcoming',
    role: 'attendee',
  });

  await createConferenceEvent(userId, {
    title: 'Teaching & Learning Excellence Forum',
    eventType: 'teaching_learning_conference',
    location: 'University of Colombo',
    date: '2026-06-12',
    endDate: '2026-06-13',
    status: 'presented',
    role: 'presenter',
    paperTitle: 'Integrating AI Tools in Undergraduate CS Curriculum',
  });

  // --- Seed Directory Mock Users ---
  await seedDirectoryUsers();

  console.log('[Seed] New collections seeded successfully.');
}

export async function seedDirectoryUsers() {
  console.log('[Seed] Seeding internal faculty directory users...');
  
  const mockFaculty = [
    {
      uid: 'prof_alan_t',
      name: 'Dr. Alan Turing',
      email: 'alan.turing@campusmind.edu',
      role: 'professor',
      department: 'Computer Science',
      institution: 'CampusMind University',
      phone: '+1 (555) 101-0101',
      officeLocation: 'Science Building, Rm 404',
      bio: 'Pioneer of theoretical computer science and artificial intelligence. Currently researching the mathematical biology of morphogenesis.',
      isSeeded: true
    },
    {
      uid: 'prof_ada_l',
      name: 'Dr. Ada Lovelace',
      email: 'ada.lovelace@campusmind.edu',
      role: 'senior_professor',
      department: 'Mathematics',
      institution: 'CampusMind University',
      phone: '+1 (555) 202-0202',
      officeLocation: 'Mathematics Wing, Rm 101',
      bio: 'First computer programmer. Focused on analytical engines and the potential for machines to go beyond pure calculation.',
      isSeeded: true
    },
    {
      uid: 'dr_grace_h',
      name: 'Dr. Grace Hopper',
      email: 'grace.hopper@campusmind.edu',
      role: 'associate_professor',
      department: 'Software Engineering',
      institution: 'CampusMind University',
      phone: '+1 (555) 303-0303',
      officeLocation: 'Engineering Block, Rm 200',
      bio: 'Co-inventor of COBOL. Advocate for machine-independent programming languages and standardization.',
      isSeeded: true
    },
    {
      uid: 'prof_richard_f',
      name: 'Dr. Richard Feynman',
      email: 'richard.feynman@campusmind.edu',
      role: 'professor',
      department: 'Physics',
      institution: 'CampusMind University',
      phone: '+1 (555) 404-0404',
      officeLocation: 'Physics Dept, Rm 314',
      bio: 'Nobel laureate in Physics. Known for work in quantum mechanics, quantum electrodynamics, and particle physics.',
      isSeeded: true
    },
    {
      uid: 'dr_marie_c',
      name: 'Dr. Marie Curie',
      email: 'marie.curie@campusmind.edu',
      role: 'senior_professor',
      department: 'Chemistry',
      institution: 'CampusMind University',
      phone: '+1 (555) 505-0505',
      officeLocation: 'Chemistry Labs, Rm 100',
      bio: 'First woman to win a Nobel Prize. Pioneering research on radioactivity and discovery of polonium and radium.',
      isSeeded: true
    }
  ];

  const { createUser } = await import('./firestore');

  for (const faculty of mockFaculty) {
    try {
      // @ts-ignore - we know it matches the schema
      await createUser(faculty.uid, faculty);
    } catch (e) {
      console.warn('Failed to seed user', faculty.uid, e);
    }
  }
}
