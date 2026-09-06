import { AuditRecord } from './firestoreTypes';

export function getMockRichAuditRecord(record: AuditRecord): AuditRecord {
  const isISO = record.auditTitle.toLowerCase().includes('iso') || record.auditTitle.toLowerCase().includes('security');
  const isGDPR = record.auditTitle.toLowerCase().includes('gdpr') || record.auditTitle.toLowerCase().includes('data protection');
  
  let criteria: NonNullable<AuditRecord['criteria']> = [];
  let auditScope = 'General departmental processes and compliance.';
  let overallScore = 85;

  if (isISO) {
    auditScope = 'Information Security Management System (ISMS) across all IT infrastructure and academic databases.';
    overallScore = 92;
    criteria = [
      {
        clause: 'ISO 27001: 5.1',
        description: 'Leadership and Commitment',
        complianceStatus: 'Compliant',
        auditorNotes: 'Top management has demonstrated leadership and commitment with respect to the ISMS.',
        evidenceFiles: [
          { name: 'ISMS_Policy_Signed.pdf', url: 'https://example.com/isms-policy' }
        ]
      },
      {
        clause: 'ISO 27001: 6.1.2',
        description: 'Information Security Risk Assessment',
        complianceStatus: 'Minor Non-Conformity',
        auditorNotes: 'Risk assessment methodology is documented, but asset owners for legacy academic systems were not clearly defined.',
        evidenceFiles: [
          { name: 'Risk_Register_Q3.xlsx', url: 'https://example.com/risk-register' }
        ]
      },
      {
        clause: 'ISO 27001: 8.2',
        description: 'Information Security Risk Treatment',
        complianceStatus: 'Observation',
        auditorNotes: 'Risk treatment plan exists, but timelines for implementing MFA on student portals are slipping.',
        evidenceFiles: []
      },
      {
        clause: 'ISO 27001: 11.2.9',
        description: 'Clear Desk and Clear Screen Policy',
        complianceStatus: 'Major Non-Conformity',
        auditorNotes: 'Multiple instances of unattended logged-in terminals in the faculty lounge and library staff areas.',
        evidenceFiles: [
          { name: 'Audit_Photos_Annex_A.pdf', url: 'https://example.com/audit-photos' }
        ]
      }
    ];
  } else if (isGDPR) {
    auditScope = 'Processing of personal data belonging to EU students and international staff members.';
    overallScore = 98;
    criteria = [
      {
        clause: 'GDPR Article 5(1)(c)',
        description: 'Data Minimisation',
        complianceStatus: 'Compliant',
        auditorNotes: 'Admission forms only collect strictly necessary data. Legacy forms have been phased out.',
        evidenceFiles: []
      },
      {
        clause: 'GDPR Article 15',
        description: 'Right of Access by the Data Subject',
        complianceStatus: 'Observation',
        auditorNotes: 'Process is in place, but average response time to Data Subject Access Requests (DSARs) is 25 days (limit is 30). Could be improved.',
        evidenceFiles: [
          { name: 'DSAR_Log_2026.csv', url: 'https://example.com/dsar-log' }
        ]
      },
      {
        clause: 'GDPR Article 32',
        description: 'Security of Processing',
        complianceStatus: 'Compliant',
        auditorNotes: 'All databases containing personal data are encrypted at rest and in transit.',
        evidenceFiles: [
          { name: 'Encryption_Architecture.pdf', url: 'https://example.com/encryption' }
        ]
      }
    ];
  } else {
    auditScope = 'Internal review of laboratory safety protocols and emergency preparedness.';
    overallScore = 78;
    criteria = [
      {
        clause: 'SAF-01',
        description: 'Emergency Exits & Signage',
        complianceStatus: 'Compliant',
        auditorNotes: 'All exits are clearly marked and unobstructed.',
        evidenceFiles: []
      },
      {
        clause: 'SAF-05',
        description: 'Chemical Storage',
        complianceStatus: 'Major Non-Conformity',
        auditorNotes: 'Flammable solvents in Lab 304 were stored outside of the designated fire-rated cabinet.',
        evidenceFiles: [
          { name: 'Lab_304_Incident_Report.pdf', url: 'https://example.com/incident' }
        ]
      }
    ];
  }

  return {
    ...record,
    auditScope,
    overallScore,
    criteria
  };
}
