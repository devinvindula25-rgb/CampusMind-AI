import { AccreditationRecord } from './firestoreTypes';

/**
 * Derives SLQF level and credits from programme name
 */
function getSLQFDetails(programmeName: string) {
  const name = programmeName.toLowerCase();
  if (name.includes('phd') || name.includes('doctorate')) return { level: 10, credits: 90 };
  if (name.includes('mphil')) return { level: 9, credits: 60 };
  if (name.includes('msc') || name.includes('ma ') || name.includes('master')) return { level: 9, credits: 60 };
  if (name.includes('pg dip') || name.includes('postgraduate diploma')) return { level: 8, credits: 30 };
  if (name.includes('bsc') || name.includes('ba ') || name.includes('beng') || name.includes('bachelor')) return { level: 6, credits: 120 };
  if (name.includes('dip') || name.includes('diploma')) return { level: 3, credits: 30 };
  return { level: 6, credits: 120 }; // Default to Bachelors
}

export function getMockSLQFAccreditation(record: AccreditationRecord): AccreditationRecord {
  const { level, credits } = getSLQFDetails(record.programmeName);

  // Generate rich SLQF standards for this specific level
  const standards: NonNullable<AccreditationRecord['standards']> = [
    {
      code: 'SLQF-01',
      title: 'Knowledge and Understanding',
      description: `Students must demonstrate advanced knowledge in ${record.programmeName} in accordance with SLQF Level ${level} descriptors.`,
      status: 'met',
      assignee: 'Prof. J. Silva',
      dueDate: '2026-08-15',
      evidenceList: [
        { name: 'Syllabus Alignment Matrix.pdf', url: 'https://example.com/matrix' },
        { name: 'External Examiner Report.pdf', url: 'https://example.com/report' },
      ],
      feedback: 'Excellent alignment with international curriculum guidelines.',
    },
    {
      code: 'SLQF-02',
      title: 'Practice: Applied Knowledge and Understanding',
      description: `Graduates must be able to apply theoretical knowledge to solve complex practical problems expected at Level ${level}.`,
      status: record.status === 'expired' ? 'unmet' : 'met',
      assignee: 'Dr. A. Perera',
      dueDate: '2026-09-01',
      evidenceList: [
        { name: 'Capstone Project Guidelines.pdf', url: 'https://example.com/capstone' },
        { name: 'Industry Internship Feedback.pdf', url: 'https://example.com/internship' },
      ],
      feedback: record.status === 'expired' ? 'Internship duration needs to be extended to 6 months.' : 'Strong industry collaboration noted.',
    },
    {
      code: 'SLQF-03',
      title: 'Cognitive Skills',
      description: 'Ability to think critically, innovate, and formulate independent solutions.',
      status: record.status === 'under_review' ? 'pending' : 'met',
      assignee: 'Dr. S. Bandara',
      dueDate: '2026-09-15',
      evidenceList: [
        { name: 'Assessment Rubrics.pdf', url: 'https://example.com/rubric' },
      ],
      feedback: record.status === 'under_review' ? 'Awaiting moderation review.' : '',
    },
    {
      code: 'SLQF-04',
      title: 'Communication, ICT and Numeracy Skills',
      description: 'Effective communication in academic and professional contexts, supported by numerical and digital literacy.',
      status: 'pending',
      assignee: 'Dr. M. Fernando',
      dueDate: '2026-10-01',
      evidenceList: [],
      feedback: 'Require updated evidence for digital literacy integration.',
    },
    {
      code: 'SLQF-05',
      title: 'Interpersonal, Teamwork and Leadership',
      description: 'Ability to function effectively in multidisciplinary teams and demonstrate leadership qualities.',
      status: 'met',
      assignee: 'Prof. T. Rajakaruna',
      dueDate: '2026-10-15',
      evidenceList: [
        { name: 'Group Project Portfolios.pdf', url: 'https://example.com/group' }
      ],
    }
  ];

  // Calculate compliance score based on met standards
  const metCount = standards.filter(s => s.status === 'met' || s.status === 'completed').length;
  const complianceScore = Math.round((metCount / standards.length) * 100);

  return {
    ...record,
    slqfLevel: level,
    totalCreditsRequired: credits,
    standards,
    complianceScore
  };
}
