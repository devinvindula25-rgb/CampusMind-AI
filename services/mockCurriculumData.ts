import { CurriculumReview } from './firestoreTypes';

export function getMockRichCurriculumReview(record: CurriculumReview): CurriculumReview {
  const isCS = record.programmeName.toLowerCase().includes('computer') || record.programmeName.toLowerCase().includes('software');
  const isData = record.programmeName.toLowerCase().includes('data');
  const isCyber = record.programmeName.toLowerCase().includes('cyber');

  let stakeholderFeedback: NonNullable<CurriculumReview['stakeholderFeedback']> = [];
  let modules: NonNullable<CurriculumReview['modules']> = [];
  let budgetRequired = '$0';
  let targetImplementationDate = 'Fall 2027';

  if (isCS) {
    budgetRequired = '$15,000 (Software Licenses & Cloud Credits)';
    targetImplementationDate = 'Spring 2027';
    stakeholderFeedback = [
      { role: 'Industry Partner', comment: 'Students need more exposure to cloud-native architectures.', date: '2026-08-15' },
      { role: 'Alumni', comment: 'The C++ module was good for theory, but JS/TS is what I use daily.', date: '2026-07-22' }
    ];
    modules = [
      {
        code: 'CS105',
        title: 'Introduction to Programming',
        slqfAlignment: 'SLQF Level 5: Knowledge & Understanding. Assesses basic programming logic.',
        issues: 'Current syllabus relies too heavily on C++. Students struggle to transition to web frameworks later.',
        proposedChanges: 'Transition primary instruction language to Python or JavaScript. Introduce modern ES6 concepts.',
        competencies: ['Basic Algorithms', 'Data Types & Structures', 'ES6 JavaScript', 'Version Control'],
        credits: 4,
        documents: [
          { name: 'CS105_Proposed_Syllabus_2027.pdf', url: 'https://example.com/cs105' }
        ]
      },
      {
        code: 'SE201',
        title: 'Web Development I',
        slqfAlignment: 'SLQF Level 6: Practice & Cognitive Skills. Focuses on building functional software artifacts.',
        issues: 'Syllabus still lists PHP as a core requirement. Lacks modern SPA frameworks.',
        proposedChanges: 'Remove PHP. Introduce React.js and Next.js as core technologies.',
        competencies: ['Component-based UI', 'State Management', 'REST API Integration', 'Web Security'],
        credits: 3,
        documents: [
          { name: 'SE201_React_Integration_Plan.pdf', url: 'https://example.com/se201' }
        ]
      }
    ];
  } else if (isData) {
    budgetRequired = '$8,500 (GPU Cloud Instances)';
    targetImplementationDate = 'Fall 2027';
    stakeholderFeedback = [
      { role: 'Faculty', comment: 'We need more budget for AWS SageMaker to run these labs.', date: '2026-08-01' }
    ];
    modules = [
      {
        code: 'DS302',
        title: 'Machine Learning Fundamentals',
        slqfAlignment: 'SLQF Level 7: Advanced Cognitive Skills. Requires complex problem formulation.',
        issues: 'Strong theory, but students lack practical MLOps skills for deploying models.',
        proposedChanges: 'Integrate Docker and Kubernetes labs. Reduce theoretical proofs by 10%.',
        competencies: ['Model Training', 'MLOps pipeline deployment', 'Dockerization', 'Performance Tuning'],
        credits: 4,
        documents: [
          { name: 'DS302_MLOps_Lab_Guide.pdf', url: 'https://example.com/ds302' }
        ]
      }
    ];
  } else if (isCyber) {
    budgetRequired = '$4,000 (Cyber Range Subscriptions)';
    targetImplementationDate = 'Fall 2027';
    stakeholderFeedback = [
      { role: 'Industry Partner', comment: 'Zero-trust is mandatory for new grads.', date: '2026-08-20' }
    ];
    modules = [
      {
        code: 'CY401',
        title: 'Network Security',
        slqfAlignment: 'SLQF Level 6: Practice & Responsibility. Focuses on securing enterprise networks.',
        issues: 'Well-aligned with current standards. Needs minor updates to include Zero-Trust architecture.',
        proposedChanges: 'Add a 2-week module specifically on Zero-Trust principles.',
        competencies: ['Network Protocols', 'Zero-Trust Architecture', 'Penetration Testing', 'Cryptography'],
        credits: 3,
        documents: []
      }
    ];
  } else {
    budgetRequired = '$0';
    targetImplementationDate = 'Spring 2027';
    stakeholderFeedback = [
      { role: 'Student Rep', comment: 'The reading materials are very outdated.', date: '2026-08-10' }
    ];
    modules = [
      {
        code: 'GEN101',
        title: 'General Module',
        slqfAlignment: 'SLQF Level 5: Communication & ICT',
        issues: 'Requires updating to reflect recent technological advancements.',
        proposedChanges: 'Modernize syllabus and reading materials.',
        competencies: ['Critical Thinking', 'Academic Writing'],
        credits: 3,
      }
    ];
  }

  return {
    ...record,
    stakeholderFeedback,
    budgetRequired,
    targetImplementationDate,
    modules
  };
}
