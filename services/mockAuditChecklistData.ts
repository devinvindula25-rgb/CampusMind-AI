import { AuditChecklistItem } from './firestoreTypes';

export const STATIC_CHECKLIST = [
  { id: '1', title: 'Programme learning outcomes documented', status: 'completed' },
  { id: '2', title: 'Course syllabi updated for current year', status: 'completed' },
  { id: '3', title: 'Student work samples collected (A, B, C grades)', status: 'pending' },
  { id: '4', title: 'Faculty qualifications matrix updated', status: 'completed' },
  { id: '5', title: 'Assessment rubrics aligned with outcomes', status: 'pending' },
  { id: '6', title: 'Advisory board meeting minutes uploaded', status: 'pending' },
  { id: '7', title: 'Continuous improvement actions documented', status: 'completed' },
  { id: '8', title: 'Lab safety certificates renewed', status: 'completed' },
];

export function getMockRichChecklistItem(item: Partial<AuditChecklistItem>): AuditChecklistItem {
  const t = item.title?.toLowerCase() || '';
  
  let description = 'Ensure all documentation meets the institutional standard.';
  let assignee = 'Dept. Coordinator';
  let dueDate = '2026-10-15';
  let notes = '';
  let evidenceFiles: { name: string, url: string }[] = [];

  if (t.includes('learning outcomes')) {
    description = 'All programme learning outcomes (PLOs) must be documented and mapped to the SLQF Level 6 descriptors.';
    assignee = 'Prof. A. Perera';
    notes = 'Awaiting final senate approval on the latest revisions.';
    evidenceFiles = [
      { name: 'PLO_Mapping_2026.pdf', url: 'https://example.com/plo' }
    ];
  } else if (t.includes('syllabi updated')) {
    description = 'Ensure all course syllabi for the current academic year reflect recent industry trends and are approved by the board of study.';
    assignee = 'Module Coordinators';
    evidenceFiles = [
      { name: 'Syllabus_Archive_26.zip', url: 'https://example.com/syllabi' }
    ];
  } else if (t.includes('student work')) {
    description = 'Collect anonymized samples of student work demonstrating high (A), average (B), and low (C) achievement against rubrics.';
    assignee = 'QA Cell';
    notes = 'Missing samples for SE3014.';
  } else if (t.includes('qualifications matrix')) {
    description = 'Update the faculty qualifications matrix (FQM) to ensure alignment with accreditation body requirements (e.g., minimum PhD ratios).';
    assignee = 'HR Department';
    evidenceFiles = [
      { name: 'FQM_Oct_2026.xlsx', url: 'https://example.com/fqm' }
    ];
  } else if (t.includes('rubrics aligned')) {
    description = 'All final assessment rubrics must explicitly align with Course Learning Outcomes (CLOs).';
    assignee = 'Exam Branch';
  } else if (t.includes('advisory board')) {
    description = 'Upload the signed minutes of the most recent Industry Advisory Board meeting.';
    assignee = 'Dept. Head';
    notes = 'Meeting scheduled for next week.';
  } else if (t.includes('continuous improvement')) {
    description = 'Document how previous audit feedback has been incorporated into the current curriculum (CQI report).';
    assignee = 'QA Cell';
    evidenceFiles = [
      { name: 'CQI_Report_2025_26.pdf', url: 'https://example.com/cqi' }
    ];
  } else if (t.includes('safety certificates')) {
    description = 'Renew and upload all relevant laboratory safety and fire compliance certificates.';
    assignee = 'Lab Manager';
    evidenceFiles = [
      { name: 'Fire_Safety_Cert.pdf', url: 'https://example.com/fire-safety' },
      { name: 'Chemical_Handling_Log.pdf', url: 'https://example.com/chem-log' }
    ];
  }

  return {
    id: item.id || `chk-${Date.now()}`,
    departmentId: item.departmentId || 'cs-dept',
    title: item.title || 'Untitled Checklist Item',
    description,
    status: (item.status as any) || 'pending',
    assignee,
    dueDate,
    notes,
    evidenceFiles,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
