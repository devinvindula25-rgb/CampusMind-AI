import type { SupervisionRecord } from './firestoreTypes';

export function getMockSupervisionDetails(studentLevel: string, studentName: string): Partial<SupervisionRecord> {
  const isDoctoral = studentLevel === 'doctoral';
  const isPostgrad = studentLevel === 'postgraduate';
  const isUndergrad = studentLevel === 'undergraduate';

  // Base mock info
  const nameSlug = studentName.toLowerCase().replace(/[^a-z]/g, '');
  const studentId = `mock_student_${nameSlug}`;

  if (isDoctoral) {
    return {
      studentId,
      abstract: 'This research investigates deep learning models for natural language processing specific to low-resource languages, focusing on Sinhala and Tamil code-switching phenomena. The objective is to develop a novel transformer-based architecture that can handle morphological richness without extensive pre-training corpora.',
      funding: 'Funded by the University Grants Commission (UGC) National Research Grant.',
      coSupervisors: [
        { userId: 'mock_tbandara', name: 'Prof. T. Bandara', role: 'Co-Supervisor', email: 'tbandara@univ.edu' },
      ],
      meetingLogs: [
        { date: '2026-08-15', topic: 'Review of Chapter 4 Draft', nextSteps: 'Revise the methodology section to include baseline comparisons.', status: 'completed' },
        { date: '2026-08-01', topic: 'Data Collection Progress', nextSteps: 'Finish compiling the Twitter dataset for code-switching.', status: 'completed' },
        { date: '2026-07-15', topic: 'Conference Paper Submission', nextSteps: 'Submit to EMNLP 2026.', status: 'completed' },
        { date: '2026-09-01', topic: 'Mock Viva Preparation', nextSteps: 'Prepare presentation slides.', status: 'scheduled' },
      ],
      publications: [
        { title: 'A Novel Approach to Sinhala Code-Switching', venue: 'ACL 2025', date: '2025-07-10', status: 'published' },
        { title: 'Morphological Parsing using Transformers', venue: 'EMNLP 2026', date: '2026-10-01', status: 'under_review' },
      ]
    };
  }

  if (isPostgrad) {
    return {
      studentId,
      abstract: 'Developing a predictive model for student retention in online learning environments using engagement metrics and socio-demographic data. The study utilizes logs from the university LMS to build a real-time early warning system.',
      funding: 'Self-funded',
      coSupervisors: [
        { userId: 'mock_msilva', name: 'Dr. M. Silva', role: 'Co-Supervisor', email: 'msilva@univ.edu' },
      ],
      meetingLogs: [
        { date: '2026-08-20', topic: 'Data Preprocessing', nextSteps: 'Handle missing values in the engagement logs.', status: 'completed' },
        { date: '2026-08-05', topic: 'Initial Model Results', nextSteps: 'Try a Random Forest model as a baseline.', status: 'completed' },
        { date: '2026-09-05', topic: 'Draft Review', nextSteps: 'Review Literature Review chapter.', status: 'scheduled' },
      ],
      publications: [
        { title: 'Predicting Dropout in Virtual Learning Environments', venue: 'ICER 2026', date: '2026-08-01', status: 'published' },
      ]
    };
  }

  // Undergraduate
  return {
    studentId,
    abstract: 'A mobile application for smart agriculture, utilizing IoT sensors to monitor soil moisture and temperature, and providing real-time alerts to farmers via SMS.',
    funding: 'Faculty Innovation Grant',
    coSupervisors: [],
    meetingLogs: [
      { date: '2026-08-10', topic: 'Hardware Setup', nextSteps: 'Connect the moisture sensors to the Raspberry Pi.', status: 'completed' },
      { date: '2026-07-25', topic: 'Requirements Gathering', nextSteps: 'Finalize the UI mockups for the app.', status: 'completed' },
      { date: '2026-08-25', topic: 'Testing Phase', nextSteps: 'Conduct field testing at the university farm.', status: 'scheduled' },
    ],
    publications: []
  };
}
