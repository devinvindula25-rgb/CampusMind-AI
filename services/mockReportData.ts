import { ComplianceReport } from './firestoreTypes';

export function getMockRichReport(record: ComplianceReport): ComplianceReport {
  const t = record.title.toLowerCase();
  
  let executiveSummary = 'An AI-generated draft reviewing departmental performance metrics and operational compliance over the given period.';
  let aiConfidenceScore = 88;
  let sections: NonNullable<ComplianceReport['sections']> = [];

  if (t.includes('diversity')) {
    aiConfidenceScore = 94;
    executiveSummary = 'This report analyzes the Q3 2026 diversity and inclusion metrics across the faculty. It highlights steady progress in inclusive hiring practices but identifies retention challenges in senior academic roles among underrepresented groups.';
    sections = [
      {
        title: 'Hiring Demographics',
        status: 'compliant',
        score: 95,
        content: 'During Q3 2026, 42% of new faculty hires identified as belonging to underrepresented minorities (URM). This exceeds the institutional target of 35%.',
        aiRecommendations: [
          'Maintain current blind-resume screening practices.',
          'Expand outreach to targeted academic networks.'
        ],
        evidenceFiles: [
          { name: 'Q3_Hiring_Data.csv', url: 'https://example.com/hiring' }
        ]
      },
      {
        title: 'Retention Rates',
        status: 'at_risk',
        score: 65,
        content: 'While hiring has improved, the voluntary turnover rate for senior female faculty increased by 2.1% compared to Q2.',
        aiRecommendations: [
          'Conduct targeted stay-interviews for tenured faculty.',
          'Review the equity of the current promotion pipeline.'
        ],
        evidenceFiles: [
          { name: 'Exit_Interviews_Summary.pdf', url: 'https://example.com/exit' }
        ]
      }
    ];
  } else if (t.includes('integrity')) {
    aiConfidenceScore = 91;
    executiveSummary = 'An annual review of academic integrity violations, honor council proceedings, and the effectiveness of current proctoring solutions. The data suggests a shift from traditional plagiarism to unauthorized AI assistance.';
    sections = [
      {
        title: 'Plagiarism & Turnitin Metrics',
        status: 'compliant',
        score: 98,
        content: 'Traditional copy-paste plagiarism rates have dropped by 40% year-over-year. Turnitin similarity scores across the department average at a healthy 12%.',
        evidenceFiles: [
          { name: 'Turnitin_Aggregated_25_26.pdf', url: 'https://example.com/turnitin' }
        ]
      },
      {
        title: 'Generative AI Violations',
        status: 'action_required',
        score: 55,
        content: 'Reported cases of unauthorized AI usage in final assessments increased by 300%. Faculty struggle to definitively prove violations using current detection tools.',
        aiRecommendations: [
          'Update the honor code to explicitly define authorized vs. unauthorized AI use.',
          'Shift towards more oral or invigilated written examinations.'
        ],
        evidenceFiles: [
          { name: 'Honor_Council_AI_Cases.xlsx', url: 'https://example.com/ai-cases' }
        ]
      }
    ];
  } else {
    // Default Compliance Report
    aiConfidenceScore = 82;
    executiveSummary = 'General compliance overview identifying minor process gaps in administrative record keeping.';
    sections = [
      {
        title: 'Record Keeping',
        status: 'compliant',
        score: 85,
        content: 'Most departmental records are digitized and securely stored.',
        evidenceFiles: []
      }
    ];
  }

  return {
    ...record,
    executiveSummary,
    aiConfidenceScore,
    sections,
    generationDate: record.generationDate || new Date().toISOString(),
  };
}
