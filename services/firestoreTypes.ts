/**
 * CampusMind AI - Firestore Document Type Definitions
 * TypeScript interfaces for every Firestore collection document.
 */

// ─── Personal Hub ─────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'lecturer' | 'senior_lecturer' | 'associate_professor' | 'professor' | 'senior_professor';
  department: string;
  institution?: string;
  avatar?: string;
  phone?: string;
  officeLocation?: string;
  bio?: string;
  expertise?: string[];
  qualifications?: { degree: string; institution: string; year: number }[];
  teachingModules?: { courseCode: string; courseName: string; semester: string }[];
  evidenceFiles?: { name: string; url: string }[];
  isSeeded?: boolean; // Flag for auto-seed on first login
  orcidId?: string;
  researchGateUrl?: string;
  googleScholarUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  type: 'lecture_prep' | 'research_writing' | 'student_consultations' | 'assessment_review' | 'meetings' | 'admin' | 'break' | 'external';
  isAI?: boolean;
  notes?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  externalSource?: 'google' | 'microsoft' | 'device';
  meetingId?: string;
  createdAt: string;
}

export interface Meeting {
  id?: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'in_person' | 'virtual' | 'hybrid';
  room?: string;
  teamsLink?: string;
  attendees: string[];
  attendeeIds?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  agenda?: string[];
  minutes?: string;
  createdAt: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'compliance' | 'review' | 'ai_recommendation' | 'deadline' | 'system' | 'meeting' | 'research';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ResearchProject {
  id?: string;
  userId: string;
  title: string;
  status: 'proposed' | 'active' | 'completed' | 'paused';
  publications: number;
  conferences: number;
  grant?: { title: string; amount: string; status: 'applied' | 'awarded' | 'rejected' };
  ethics: 'not_submitted' | 'submitted' | 'approved' | 'rejected';
  predictedDelay: number | null;
  progress: number; // 0-100
  deadline: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id?: string;
  userId: string;
  projectId?: string;
  title: string;
  journal: string;
  year: number;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published' | 'rejected';
  abstract?: string;
  isbn?: string;
  url?: string;
  doi?: string;
  authors?: string[];
  coAuthors?: string[];
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  keywords?: string[];
  createdAt: string;
}

export interface WellnessLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  stressLevel: number; // 1-5
  workingHours?: number;
  meetingsCount?: number;
  sleepHours?: number;
  waterIntakeMl?: number;
  exerciseMinutes?: number;
  mood?: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  notes?: string;
  createdAt: string;
}

export interface EmailDraft {
  id?: string;
  userId: string;
  subject: string;
  body: string;
  recipient?: string;
  context?: 'student_inquiry' | 'extension_request' | 'supervisor' | 'committee';
  status: 'draft' | 'sent' | 'archived';
  createdAt: string;
}

export type ConferenceEventType =
  | 'international_conference' | 'national_conference' | 'research_symposium'
  | 'scientific_meeting' | 'workshop_seminar' | 'webinar_forum'
  | 'congress_meeting' | 'methodology_workshop' | 'grant_writing_workshop'
  | 'teaching_learning_conference' | 'curriculum_workshop'
  | 'poster_presentation' | 'oral_presentation' | 'keynote_lecture'
  | 'panel_discussion';

export interface ConferenceEvent {
  id?: string;
  userId: string;
  title: string;
  eventType: ConferenceEventType;
  location?: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  status: 'upcoming' | 'attended' | 'presented' | 'cancelled';
  role: 'attendee' | 'presenter' | 'organizer' | 'panelist' | 'keynote_speaker';
  paperTitle?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeachingSession {
  id: string;
  order?: number;
  type: 'lecture' | 'tutorial' | 'practical';
  topic: string;
  description?: string;
  date: string;
  duration: number; // in hours
  status: 'upcoming' | 'completed';
}

export interface TeachingCourse {
  id?: string;
  userId: string;
  courseName: string;
  moduleCode: string;
  semester: string; // e.g. "2026 S1"
  contactHours: number;
  lectures: number;
  tutorials: number;
  practicals: number;
  sessions?: TeachingSession[];
  assessments: {
    type: 'assignment' | 'quiz' | 'midterm' | 'final_exam' | 'viva' | 'osce_ospe';
    name: string;
    description?: string;
    weight: number;
    score?: string;
    dueDate?: string;
    status?: 'upcoming' | 'in_progress' | 'completed' | 'graded';
  }[];
  studentFeedback: {
    rating: number; // 1-5
    comment: string;
    date: string;
  }[];
  averageRating: number;
  status: 'active' | 'completed' | 'upcoming';
  createdAt: string;
  updatedAt: string;
}

export type CommitteeType =
  | 'board_of_management' | 'board_of_study' | 'specialty_board'
  | 'aaaec' | 'ethics_review' | 'finance_management'
  | 'audit' | 'grievance' | 'inquiry_disciplinary'
  | 'examination_board' | 'iqac' | 'subcommittee_adhoc';

export interface CommitteeMembership {
  id?: string;
  userId: string;
  committeeName: string;
  committeeType: CommitteeType;
  role: 'member' | 'chair' | 'secretary' | 'vice_chair';
  startDate: string;
  endDate?: string;
  meetingsAttended: number;
  totalMeetings: number;
  status: 'active' | 'completed' | 'upcoming';
  notes?: string;
  description?: string;
  slqfAlignment?: string;
  members?: { userId?: string; name: string; role: string; email?: string }[];
  recentDecisions?: { date: string; title: string; outcome: 'approved' | 'rejected' | 'pending'; description: string }[];
  attendanceRecords?: { date: string; status: 'present' | 'absent' | 'excused'; type: 'regular' | 'special'; notes?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SupervisionRecord {
  id?: string;
  userId: string;
  studentName: string;
  studentLevel: 'undergraduate' | 'postgraduate' | 'doctoral';
  role: 'supervisor' | 'co_supervisor';
  thesisTitle: string;
  researchProposal: 'not_submitted' | 'submitted' | 'approved' | 'revision_required';
  ethicsApproval: 'not_submitted' | 'submitted' | 'approved' | 'rejected';
  meetingsCount: number;
  progressReports: number;
  milestones: {
    title: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
  }[];
  studentId?: string;
  abstract?: string;
  funding?: string;
  meetingLogs?: { date: string; topic: string; nextSteps: string; status: 'completed' | 'scheduled' }[];
  publications?: { title: string; venue: string; date: string; status: 'published' | 'under_review' | 'draft' }[];
  coSupervisors?: { userId?: string; name: string; role: string; email?: string }[];
  thesisSubmission: 'not_started' | 'drafting' | 'submitted' | 'under_examination' | 'passed';
  vivaDate?: string;
  vivaStatus?: 'not_scheduled' | 'scheduled' | 'passed' | 'failed' | 'minor_corrections' | 'major_corrections';
  status: 'active' | 'completed' | 'on_hold';
  createdAt: string;
  updatedAt: string;
}

// ─── Institutional Hub ────────────────────────────────────────

export interface AccreditationRecord {
  id?: string;
  departmentId: string;
  programmeName: string;
  accreditingBody: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'under_review';
  expiryDate: string;
  lastReviewDate?: string;
  complianceScore?: number;
  slqfLevel?: number; // e.g. 6 for BSc
  totalCreditsRequired?: number; // e.g. 120
  standards?: { 
    code: string; 
    title: string; 
    description?: string;
    status: 'completed' | 'met' | 'pending' | 'unmet'; 
    assignee?: string;
    dueDate?: string;
    evidenceList?: { name: string; url: string }[];
    feedback?: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumReview {
  id?: string;
  departmentId: string;
  programmeName: string;
  reviewType: 'annual' | 'periodic' | 'ad_hoc';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  reviewer?: string;
  findings?: string;
  recommendations?: string[];
  stakeholderFeedback?: { role: string; comment: string; date: string }[];
  budgetRequired?: string;
  targetImplementationDate?: string;
  modules?: {
    code: string;
    title: string;
    slqfAlignment: string;
    issues: string;
    proposedChanges: string;
    competencies?: string[];
    credits: number;
    documents?: { name: string; url: string }[];
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  id?: string;
  departmentId: string;
  auditTitle: string;
  auditType: 'internal' | 'external' | 'regulatory';
  status: 'scheduled' | 'in_progress' | 'completed' | 'follow_up_required';
  date: string;
  auditor?: string;
  findings?: string;
  auditScope?: string;
  overallScore?: number;
  criteria?: {
    clause: string;
    description: string;
    complianceStatus: 'Compliant' | 'Minor Non-Conformity' | 'Major Non-Conformity' | 'Observation';
    auditorNotes: string;
    evidenceFiles?: { name: string; url: string }[];
  }[];
  nonConformities?: number;
  actionItems?: { description: string; assignee: string; dueDate: string; status: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditChecklistItem {
  id?: string;
  departmentId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  evidenceFiles?: { name: string; url: string }[];
  assignee?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id?: string;
  departmentId: string;
  title: string;
  reportType: 'quarterly' | 'annual' | 'ad_hoc' | 'regulatory';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  period: string;
  summary?: string;
  complianceScore?: number;
  aiConfidenceScore?: number;
  executiveSummary?: string;
  generationDate?: string;
  sections?: { 
    title: string; 
    status: string; 
    score?: number; 
    notes?: string;
    content?: string;
    aiRecommendations?: string[];
    reviewerFeedback?: string;
    evidenceFiles?: { name: string; url: string }[];
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QADocument {
  id?: string;
  departmentId: string;
  title: string;
  category: 'policy' | 'procedure' | 'template' | 'evidence' | 'report';
  version: string;
  status: 'draft' | 'active' | 'archived' | 'under_review';
  fileUrl?: string;
  fileSize?: string;
  tags?: string[];
  aiSummary?: string;
  versionHistory?: { version: string; date: string; changes: string; author: string }[];
  evidenceFiles?: { name: string; url: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicProgramme {
  id?: string;
  departmentId: string;
  name: string;
  code: string;
  faculty: string;
  department: string;
  level: 'undergraduate' | 'postgraduate' | 'doctoral';
  accreditationStatus: 'accredited' | 'pending' | 'expired' | 'not_applied';
  reviewStatus: 'up_to_date' | 'under_review' | 'review_due' | 'overdue';
  completionRate: number;
  enrolment: number;
  satisfaction: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionalActivity {
  id?: string;
  departmentId: string;
  title: string;
  type: 'accreditation' | 'curriculum' | 'audit' | 'document' | 'general';
  timestamp: string; // ISO string for precise sorting
  timeAgo: string; // "2 hours ago"
  description: string;
  actor: string; // e.g., "Prof. T. Bandara"
  relatedModule?: string;
  status?: 'completed' | 'pending' | 'action_required';
  nextSteps?: string;
}
