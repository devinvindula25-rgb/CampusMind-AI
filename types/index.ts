/**
 * CampusMind AI - Firestore Database Types
 * Defines the schema for all Firestore collections.
 * Based on the revised academic-staff-focused ERD.
 */

import { UserRole } from '@/constants/theme';

// ─── User ────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  name: string;
  designation: string;
  department: string;
  faculty: string;
  role: UserRole;
  accountStatus: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Workload ────────────────────────────────────────────────
export interface Workload {
  id: string;
  userId: string;
  numberOfModules: number;
  numberOfStudents: number;
  teachingHours: number;
  adminHours: number;
  researchHours: number;
  assessmentDeadlines: AssessmentDeadline[];
  workloadScore: number; // 0-100, AI-calculated
  semester: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentDeadline {
  id: string;
  moduleName: string;
  deadline: string;
  type: 'exam' | 'coursework' | 'presentation' | 'project';
  studentCount: number;
}

// ─── Schedule (Academic Planner) ─────────────────────────────
export interface Schedule {
  id: string;
  userId: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  date: string;
  timeSlot: string; // e.g., "08:00-10:00"
  startTime: string;
  endTime: string;
  activityType: 'lecture_prep' | 'research_writing' | 'student_consultations' | 'assessment_review' | 'admin' | 'meetings' | 'personal' | 'break';
  title: string;
  description?: string;
  isAIGenerated: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Research Project ────────────────────────────────────────
export interface ResearchProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'proposed' | 'active' | 'completed' | 'suspended' | 'delayed';
  publications: Publication[];
  conferences: Conference[];
  grants: Grant[];
  ethicsSubmissions: EthicsSubmission[];
  predictedDelay: number | null; // days, AI-calculated
  startDate: string;
  endDate?: string;
  milestones: ResearchMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  type: 'journal' | 'conference_paper' | 'book_chapter' | 'thesis';
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published';
}

export interface Conference {
  id: string;
  name: string;
  date: string;
  location: string;
  paperTitle?: string;
  status: 'registered' | 'submitted' | 'accepted' | 'presented';
}

export interface Grant {
  id: string;
  title: string;
  fundingBody: string;
  amount: number;
  currency: string;
  status: 'applied' | 'under_review' | 'awarded' | 'rejected' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface EthicsSubmission {
  id: string;
  projectTitle: string;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_required';
  referenceNumber?: string;
}

export interface ResearchMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

// ─── Burnout Log ─────────────────────────────────────────────
export interface BurnoutLog {
  id: string;
  userId: string;
  date: string;
  workingHours: number;
  meetingLoad: number; // hours
  researchLoad: number; // hours
  teachingLoad: number; // hours
  selfReportedStressLevel: 1 | 2 | 3 | 4 | 5; // 1=Very Low, 5=Very High
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  burnoutRiskScore: number; // 0-100, AI-calculated
  createdAt: string;
}

// ─── Meeting ─────────────────────────────────────────────────
export interface Meeting {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  roomBookingInfo?: string;
  teamsLink?: string;
  attendees: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ─── Email Draft (AI Assistant) ──────────────────────────────
export interface EmailDraft {
  id: string;
  userId: string;
  contextType: 'student_inquiry' | 'extension_request' | 'supervisor_communication' | 'committee_response' | 'general';
  originalMessage?: string;
  draftContent: string;
  tone: 'formal' | 'friendly' | 'neutral';
  isAIGenerated: boolean;
  createdAt: string;
}

// ─── AI Chat Message ─────────────────────────────────────────
export interface AIChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Programme (QA Module) ───────────────────────────────────
export interface Programme {
  id: string;
  programmeName: string;
  programmeCode: string;
  faculty: string;
  department: string;
  accreditationStatus: 'accredited' | 'pending' | 'expired' | 'not_applied';
  reviewStatus: 'up_to_date' | 'review_due' | 'under_review' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────
export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'deadline' | 'burnout_alert' | 'meeting' | 'research' | 'system' | 'ai_recommendation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Dashboard Metrics ───────────────────────────────────────
export interface DashboardMetrics {
  todayScheduleItems: number;
  pendingAssessments: number;
  researchProjects: number;
  burnoutRiskScore: number;
  upcomingMeetings: number;
  unreadEmails: number;
  workloadScore: number;
  weeklyTeachingHours: number;
}
