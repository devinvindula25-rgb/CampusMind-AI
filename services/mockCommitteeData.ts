import type { CommitteeMembership } from './firestoreTypes';

export function getMockCommitteeDetails(committeeType: string, committeeName: string): Partial<CommitteeMembership> {
  const isBoardOfStudy = committeeType === 'board_of_study';
  const isIQAC = committeeType === 'iqac';
  const isEthics = committeeType === 'ethics_review';

  if (isBoardOfStudy) {
    return {
      description: 'The Board of Study governs the curriculum, syllabus updates, and academic standards for all undergraduate and postgraduate degrees within the faculty.',
      slqfAlignment: 'Monitors SLQF Level 6 (BSc Hons) and SLQF Level 10 (MSc) standards. Ensures total credit requirements (120 credits for Level 6) and learning outcomes are strictly met.',
      members: [
        { userId: 'mock_aperera', name: 'Prof. A. Perera', role: 'Chair', email: 'aperera@univ.edu' },
        { userId: 'mock_sfernando', name: 'Dr. S. Fernando', role: 'Secretary', email: 'sfernando@univ.edu' },
        { userId: 'mock_msilva', name: 'Dr. M. Silva', role: 'Member', email: 'msilva@univ.edu' },
        { userId: 'mock_rdias', name: 'Prof. R. Dias', role: 'External Member', email: 'rdias@industry.lk' },
      ],
      recentDecisions: [
        { date: '2026-08-15', title: 'Approval of CS505 Syllabus', outcome: 'approved', description: 'Approved the new syllabus for Advanced AI, aligning with SLQF Level 10.' },
        { date: '2026-07-10', title: 'Revision of Credit Weights', outcome: 'approved', description: 'Adjusted practical credits to match SLQF guidelines on contact hours.' },
        { date: '2026-06-05', title: 'New Assessment Strategy', outcome: 'pending', description: 'Proposal to introduce OSCE/OSPE for final year projects.' },
      ],
      attendanceRecords: [
        { date: '2026-08-15', status: 'present', type: 'regular', notes: 'Discussed CS505 syllabus.' },
        { date: '2026-07-10', status: 'present', type: 'regular', notes: 'Revision of credits.' },
        { date: '2026-06-05', status: 'present', type: 'regular' },
        { date: '2026-05-02', status: 'excused', type: 'special', notes: 'Academic conference travel.' },
        { date: '2026-04-10', status: 'present', type: 'regular' },
        { date: '2026-03-05', status: 'present', type: 'regular' },
        { date: '2026-02-12', status: 'present', type: 'regular' },
        { date: '2026-01-20', status: 'absent', type: 'special', notes: 'Medical leave.' },
      ]
    };
  }

  if (isIQAC) {
    return {
      description: 'The Internal Quality Assurance Cell (IQAC) is responsible for maintaining and enhancing the quality of academic and administrative activities.',
      slqfAlignment: 'Audits faculty processes against the UGC Quality Assurance framework and ensures all academic programs strictly adhere to SLQF progression pathways.',
      members: [
        { userId: 'mock_tbandara', name: 'Prof. T. Bandara', role: 'Director', email: 'tbandara@univ.edu' },
        { userId: 'mock_kjayasooriya', name: 'Dr. K. Jayasooriya', role: 'Member', email: 'kjaya@univ.edu' },
        { userId: 'mock_sfernando', name: 'Dr. S. Fernando', role: 'Member', email: 'sfernando@univ.edu' },
        { userId: 'mock_lcosta', name: 'Mr. L. Costa', role: 'Admin Officer', email: 'lcosta@univ.edu' },
      ],
      recentDecisions: [
        { date: '2026-08-20', title: 'Annual Self-Evaluation Report', outcome: 'approved', description: 'Finalized the ASER for the upcoming institutional review.' },
        { date: '2026-07-22', title: 'Student Feedback Mechanism', outcome: 'approved', description: 'Standardized the end-of-semester course evaluation forms.' },
      ],
      attendanceRecords: [
        { date: '2026-08-20', status: 'present', type: 'regular', notes: 'ASER review session.' },
        { date: '2026-07-22', status: 'present', type: 'regular', notes: 'Feedback forms finalized.' },
        { date: '2026-06-15', status: 'present', type: 'regular' },
        { date: '2026-05-10', status: 'present', type: 'special' },
        { date: '2026-04-05', status: 'present', type: 'regular' },
        { date: '2026-03-01', status: 'excused', type: 'regular', notes: 'Clashed with lecture schedule.' },
      ]
    };
  }

  if (isEthics) {
    return {
      description: 'Reviews all research proposals involving human or animal subjects to ensure compliance with national and international ethical guidelines.',
      slqfAlignment: 'Supports SLQF Level 10 and 12 (Masters & PhD) research integrity and publication ethics requirements.',
      members: [
        { userId: 'mock_hrathnayake', name: 'Prof. H. Rathnayake', role: 'Chair', email: 'hrathnayake@univ.edu' },
        { userId: 'mock_sfernando', name: 'Dr. S. Fernando', role: 'Secretary', email: 'sfernando@univ.edu' },
        { userId: 'mock_psenanayake', name: 'Dr. P. Senanayake', role: 'Medical Expert', email: 'psena@med.univ.edu' },
        { userId: 'mock_bthero', name: 'Rev. B. Thero', role: 'Lay Member', email: 'laymember@community.lk' },
      ],
      recentDecisions: [
        { date: '2026-08-28', title: 'ERC/26/045 Approval', outcome: 'approved', description: 'Approved clinical trial for novel bioinformatics tool.' },
        { date: '2026-08-10', title: 'ERC/26/048 Revision', outcome: 'rejected', description: 'Rejected data collection methodology; requested explicit consent forms.' },
        { date: '2026-07-05', title: 'Update to Ethical Guidelines', outcome: 'approved', description: 'Incorporated new data privacy regulations into the standard review checklist.' },
      ],
      attendanceRecords: [
        { date: '2026-08-28', status: 'present', type: 'regular' },
        { date: '2026-08-10', status: 'present', type: 'regular' },
        { date: '2026-07-05', status: 'present', type: 'regular' },
        { date: '2026-06-12', status: 'present', type: 'special' },
        { date: '2026-05-18', status: 'present', type: 'regular' },
        { date: '2026-04-20', status: 'excused', type: 'regular', notes: 'Sick leave.' },
        { date: '2026-03-15', status: 'present', type: 'regular' },
        { date: '2026-02-10', status: 'present', type: 'regular' },
        { date: '2026-01-25', status: 'present', type: 'regular' },
      ]
    };
  }

  // Fallback for any other committee
  return {
    description: `Provides oversight and governance for the ${committeeName}.`,
    slqfAlignment: 'Ensures operational alignment with university standards and UGC guidelines.',
    members: [
      { userId: 'mock_sfernando', name: 'Dr. S. Fernando', role: 'Member', email: 'sfernando@univ.edu' },
      { userId: 'mock_jdoe', name: 'Prof. J. Doe', role: 'Chair', email: 'jdoe@univ.edu' },
    ],
    recentDecisions: [
      { date: '2026-08-01', title: 'General Meeting Resolution', outcome: 'approved', description: 'Approved the minutes and action items from the previous quarter.' }
    ],
    attendanceRecords: [
      { date: '2026-08-01', status: 'present', type: 'regular' },
      { date: '2026-07-01', status: 'present', type: 'regular' },
    ]
  };
}
