import { collection, writeBatch, doc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  AccreditationRecord, 
  CurriculumReview, 
  AuditRecord, 
  ComplianceReport, 
  QADocument 
} from './firestoreTypes';

const DEPT_ID = 'cs-dept';
const USER_ID = 'devinvindula25@gmail.com'; // Admin user for createdBy

export async function seedInstitutionalData() {
  console.log('🌱 Starting massive institutional data seed for dept:', DEPT_ID);
  
  const batch = writeBatch(db);

  // 1. Accreditations
  const accreditations: Partial<AccreditationRecord>[] = [
    {
      departmentId: DEPT_ID,
      programmeName: 'BSc Computer Science',
      accreditingBody: 'ABET',
      status: 'active',
      expiryDate: '2028-12-31',
      complianceScore: 92,
      createdBy: USER_ID,
      standards: [
        { code: 'S1', title: 'Students', status: 'met' },
        { code: 'S2', title: 'Program Educational Objectives', status: 'met' },
        { code: 'S3', title: 'Student Outcomes', status: 'pending' },
        { code: 'S4', title: 'Continuous Improvement', status: 'met' },
      ]
    },
    {
      departmentId: DEPT_ID,
      programmeName: 'MSc Artificial Intelligence',
      accreditingBody: 'BCS',
      status: 'under_review',
      expiryDate: '2026-10-15',
      complianceScore: 75,
      createdBy: USER_ID,
      standards: [
        { code: 'A1', title: 'Curriculum Depth', status: 'met' },
        { code: 'A2', title: 'Ethics in AI', status: 'unmet' },
        { code: 'A3', title: 'Industry Collaboration', status: 'pending' },
      ]
    }
  ];

  accreditations.forEach(acc => {
    const ref = doc(collection(db, 'accreditation'));
    batch.set(ref, { ...acc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // 2. Curriculum Reviews
  const reviews: Partial<CurriculumReview>[] = [
    {
      departmentId: DEPT_ID,
      programmeName: 'BSc Software Engineering',
      reviewType: 'annual',
      status: 'pending',
      dueDate: '2026-11-01',
      reviewer: 'Prof. Alan Turing',
      findings: 'Needs more focus on modern web frameworks (React, Next.js).',
      recommendations: ['Introduce Web Dev II module', 'Remove outdated PHP course'],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      programmeName: 'MSc Data Science',
      reviewType: 'periodic',
      status: 'in_progress',
      dueDate: '2026-09-30',
      reviewer: 'Dr. Grace Hopper',
      findings: 'Strong theoretical foundation, but lacks practical MLOps pipelines.',
      recommendations: ['Add Docker/Kubernetes lab', 'Partner with AWS for credits'],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      programmeName: 'BSc Cybersecurity',
      reviewType: 'ad_hoc',
      status: 'completed',
      dueDate: '2026-05-15',
      reviewer: 'Prof. John von Neumann',
      findings: 'Curriculum is well-aligned with industry zero-trust standards.',
      recommendations: ['Maintain current syllabus'],
      createdBy: USER_ID
    }
  ];

  reviews.forEach(rev => {
    const ref = doc(collection(db, 'curriculumReviews'));
    batch.set(ref, { ...rev, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // 3. Audit Records
  const audits: Partial<AuditRecord>[] = [
    {
      departmentId: DEPT_ID,
      auditTitle: 'ISO 27001 Information Security Audit',
      auditType: 'external',
      status: 'scheduled',
      date: '2026-12-05',
      auditor: 'BSI Group',
      nonConformities: 0,
      actionItems: [],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      auditTitle: 'Internal Lab Safety Audit 2026',
      auditType: 'internal',
      status: 'follow_up_required',
      date: '2026-07-20',
      auditor: 'University HSE Office',
      findings: 'Several hardware labs lack adequate fire suppression systems.',
      nonConformities: 3,
      actionItems: [
        { description: 'Install FM200 gas suppression in Server Room B', assignee: 'Facilities', dueDate: '2026-09-01', status: 'in_progress' },
        { description: 'Update evacuation maps', assignee: 'Dept Admin', dueDate: '2026-08-15', status: 'completed' },
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      auditTitle: 'GDPR Compliance Check',
      auditType: 'regulatory',
      status: 'completed',
      date: '2026-01-10',
      auditor: 'Data Protection Officer',
      findings: 'All student data processing complies with GDPR guidelines.',
      nonConformities: 0,
      actionItems: [],
      createdBy: USER_ID
    }
  ];

  audits.forEach(aud => {
    const ref = doc(collection(db, 'auditRecords'));
    batch.set(ref, { ...aud, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // 4. Compliance Reports
  const reports: Partial<ComplianceReport>[] = [
    {
      departmentId: DEPT_ID,
      title: 'Q3 2026 Faculty Diversity & Inclusion Report',
      reportType: 'quarterly',
      status: 'draft',
      period: 'Q3 2026',
      summary: 'Drafting metrics for Q3. Preliminary data shows 5% increase in female faculty hires.',
      complianceScore: 88,
      sections: [
        { title: 'Hiring Metrics', status: 'draft', score: 90 },
        { title: 'Retention', status: 'pending', score: 0 }
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      title: 'Annual Academic Integrity Report 2025/2026',
      reportType: 'annual',
      status: 'approved',
      period: 'Academic Year 25/26',
      summary: 'Successfully reduced plagiarism cases by 15% using new Turnitin integration and awareness campaigns.',
      complianceScore: 98,
      sections: [
        { title: 'Incident Rates', status: 'approved', score: 100 },
        { title: 'Disciplinary Actions', status: 'approved', score: 96 }
      ],
      createdBy: USER_ID
    }
  ];

  reports.forEach(rep => {
    const ref = doc(collection(db, 'complianceReports'));
    batch.set(ref, { ...rep, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // 5. QA Documents
  const qaDocs: Partial<QADocument>[] = [
    {
      departmentId: DEPT_ID,
      title: 'Quality Assurance Policy 2026',
      category: 'policy',
      version: '3.1',
      status: 'active',
      fileSize: '2.4 MB',
      tags: ['university', 'slqf', 'mandatory'],
      aiSummary: 'This document outlines the core Quality Assurance framework for 2026, mandating periodic peer reviews, slqf alignment checks, and external moderation for all assessments. It introduces stricter penalties for non-compliance in accreditation mapping.',
      versionHistory: [
        { version: '3.1', date: '2026-08-26', changes: 'Updated SLQF mapping requirements', author: 'Dr. Silva' },
        { version: '3.0', date: '2025-12-01', changes: 'Major overhaul of QA guidelines', author: 'Prof. Bandara' }
      ],
      evidenceFiles: [
        { name: 'External_Moderator_Feedback_2025.pdf', url: 'https://example.com/ext_feedback' },
        { name: 'SLQF_Alignment_Report_v2.xlsx', url: 'https://example.com/slqf_align' }
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      title: 'Peer Review Observation Template',
      category: 'template',
      version: '1.0',
      status: 'active',
      fileSize: '156 KB',
      tags: ['teaching', 'evaluation'],
      aiSummary: 'A standard rubric for evaluating peer lecturers during active teaching sessions. Categories include student engagement, clarity of delivery, and effective use of multimedia.',
      versionHistory: [
        { version: '1.0', date: '2026-09-04', changes: 'Initial creation', author: 'Dr. Perera' }
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      title: 'Programme Approval Template',
      category: 'template',
      version: '2.0',
      status: 'under_review',
      fileSize: '342 KB',
      tags: ['curriculum', 'senate'],
      aiSummary: 'Required form for proposing new academic programs to the Senate. The V2 update requires explicit mapping to industry skills and graduate employability metrics.',
      versionHistory: [
        { version: '2.0', date: '2026-08-26', changes: 'Added employability mapping section', author: 'Admin' },
        { version: '1.5', date: '2024-02-14', changes: 'Updated senate requirements', author: 'Admin' }
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      title: 'Department Assessment Policy',
      category: 'policy',
      version: '2.1',
      status: 'active',
      fileSize: '1.1 MB',
      tags: ['exams', 'grading'],
      aiSummary: 'Dictates the distribution of continuous assessments versus final exams. Mandates a minimum of 30% continuous assessment for all undergraduate modules.',
      versionHistory: [
        { version: '2.1', date: '2026-09-04', changes: 'Clarified rules for online submissions', author: 'Prof. Rajakaruna' }
      ],
      createdBy: USER_ID
    },
    {
      departmentId: DEPT_ID,
      title: 'Draft: Remote Invigilation Guidelines',
      category: 'procedure',
      version: '0.9',
      status: 'draft',
      fileSize: '890 KB',
      tags: ['online', 'exams'],
      aiSummary: 'Proposed guidelines for conducting remote exams using AI proctoring software. Highlights privacy concerns and student consent requirements.',
      versionHistory: [
        { version: '0.9', date: '2026-09-04', changes: 'Draft for committee review', author: 'IT Dept' }
      ],
      createdBy: USER_ID
    }
  ];

  qaDocs.forEach(d => {
    const ref = doc(collection(db, 'qaDocuments'));
    batch.set(ref, { ...d, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  // Institutional Activities
  const activities = [
    {
      departmentId: DEPT_ID,
      title: 'BSc Computer Science ABET report submitted',
      type: 'accreditation',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      timeAgo: '2 hours ago',
      description: 'The final Self-Study Report (SSR) for the ABET Computing Accreditation Commission has been submitted ahead of the deadline.',
      actor: 'Prof. J. Smith',
      relatedModule: 'Accreditation',
      status: 'completed',
      nextSteps: 'Await review committee scheduling.',
    },
    {
      departmentId: DEPT_ID,
      title: 'Curriculum review for ENGL101 requires attention',
      type: 'curriculum',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: 'Yesterday',
      description: 'The syllabus for ENGL101 requires updates to reflect the new literature guidelines. Feedback from the external examiner must be incorporated.',
      actor: 'Dr. A. Silva',
      relatedModule: 'Curriculum',
      status: 'action_required',
      nextSteps: 'Schedule a syllabus review meeting with the faculty board.',
    },
    {
      departmentId: DEPT_ID,
      title: 'New QA Document uploaded: "Academic Integrity Policy v2"',
      type: 'document',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      timeAgo: '2 days ago',
      description: 'The revised Academic Integrity Policy incorporates new guidelines on AI-assisted tools and plagiarism detection.',
      actor: 'QA Office',
      relatedModule: 'Documents',
      status: 'completed',
      nextSteps: 'Distribute to all faculty and students.',
    },
    {
      departmentId: DEPT_ID,
      title: 'Internal Audit scheduled for Engineering Dept.',
      type: 'audit',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: '3 days ago',
      description: 'The annual internal QA audit for the Engineering Department has been scheduled for next week.',
      actor: 'Prof. R. Silva',
      relatedModule: 'Audits',
      status: 'pending',
      nextSteps: 'Prepare departmental QA documentation.',
    }
  ];

  console.log('Seeding Institutional Activities...');
  for (const act of activities) {
    await addDoc(collection(db, 'institutional_activities'), act);
  }

  await batch.commit();
  console.log('✅ Institutional Data seeded successfully!');
}
