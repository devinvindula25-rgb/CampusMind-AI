/**
 * CampusMind AI - Compliance Screen
 * Compliance Management Module with risk scores and visual alerts.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeComplianceReports } from '@/services/firestore';
import type { ComplianceReport } from '@/services/firestoreTypes';

const COMPLIANCE_SUMMARY = {
  overallScore: 87,
  compliant: 18,
  partiallyCompliant: 4,
  nonCompliant: 2,
  totalStandards: 24,
};

const RISK_FILTERS = ['All', 'Approved', 'Submitted', 'Draft', 'Rejected'];

export default function ComplianceScreen() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const departmentId = 'cs-dept';
    const unsub = subscribeComplianceReports(departmentId, (data) => {
      setReports(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = reports.filter((r) =>
    activeFilter === 'All' || r.status.toLowerCase() === activeFilter.toLowerCase()
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1B2A4A', '#0F172A']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Compliance</Text>
        <Text style={styles.headerSubtitle}>Institutional Standards Monitoring</Text>

        {/* Score Ring */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreRing}>
            <LinearGradient
              colors={[BrandColors.success, BrandColors.accent]}
              style={styles.scoreRingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.scoreInner}>
                <Text style={styles.scoreValue}>{COMPLIANCE_SUMMARY.overallScore}</Text>
                <Text style={styles.scorePercent}>%</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.scoreMeta}>
            <ScoreStat color={BrandColors.success} label="Compliant" value={COMPLIANCE_SUMMARY.compliant} />
            <ScoreStat color={BrandColors.warning} label="Partial" value={COMPLIANCE_SUMMARY.partiallyCompliant} />
            <ScoreStat color={BrandColors.error} label="Non-Compliant" value={COMPLIANCE_SUMMARY.nonCompliant} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {RISK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              {f !== 'All' && (
                <View style={[styles.filterDot, { backgroundColor: getRiskColor(f.toLowerCase()) }]} />
              )}
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compliance Records */}
        {filtered.map((record) => {
          const riskLevel = record.complianceScore ? (100 - record.complianceScore) : 0;
          let riskCategory = 'low';
          if (riskLevel > 50) riskCategory = 'critical';
          else if (riskLevel > 30) riskCategory = 'high';
          else if (riskLevel > 15) riskCategory = 'medium';

          return (
            <TouchableOpacity key={record.id} style={styles.recordCard} activeOpacity={0.7}>
              {/* Risk indicator stripe */}
              <View style={[styles.riskStripe, { backgroundColor: getRiskColor(riskCategory) }]} />

              <View style={styles.recordContent}>
                <View style={styles.recordTop}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordCode}>{record.reportType.toUpperCase()}</Text>
                    <Text style={styles.recordName}>{record.title}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskCategory) + '18' }]}>
                    <Text style={[styles.riskBadgeText, { color: getRiskColor(riskCategory) }]}>
                      {riskLevel}
                    </Text>
                  </View>
                </View>

                {/* Risk Bar */}
                <View style={styles.riskBarContainer}>
                  <View style={styles.riskBarTrack}>
                    <View
                      style={[
                        styles.riskBarFill,
                        {
                          width: `${riskLevel}%`,
                          backgroundColor: getRiskColor(riskCategory),
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.recordBottom}>
                  <View style={styles.recordMeta}>
                    <EvidenceBadge status={record.status === 'approved' ? 'complete' : record.status === 'submitted' ? 'partial' : 'missing'} />
                    <View style={styles.deadlineContainer}>
                      <MaterialIcons name="schedule" size={13} color="#64748B" />
                      <Text style={styles.deadlineText}>{record.period}</Text>
                    </View>
                  </View>
                  <ComplianceLevelBadge level={record.complianceScore && record.complianceScore >= 80 ? 'compliant' : 'partially_compliant'} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function ScoreStat({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.scoreStat}>
      <View style={[styles.scoreStatDot, { backgroundColor: color }]} />
      <Text style={styles.scoreStatValue}>{value}</Text>
      <Text style={styles.scoreStatLabel}>{label}</Text>
    </View>
  );
}

function EvidenceBadge({ status }: { status: string }) {
  const config = {
    complete: { icon: 'check-circle' as const, color: BrandColors.success },
    partial: { icon: 'remove-circle' as const, color: BrandColors.warning },
    missing: { icon: 'cancel' as const, color: BrandColors.error },
  }[status] || { icon: 'help' as const, color: '#94A3B8' };

  return (
    <View style={styles.evidenceBadge}>
      <MaterialIcons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.evidenceText, { color: config.color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

function ComplianceLevelBadge({ level }: { level: string }) {
  const config = {
    compliant: { bg: BrandColors.successBg, color: BrandColors.success, label: 'Compliant' },
    partially_compliant: { bg: BrandColors.warningBg, color: BrandColors.warning, label: 'Partial' },
    non_compliant: { bg: BrandColors.errorBg, color: BrandColors.error, label: 'Non-Compliant' },
  }[level] || { bg: '#eee', color: '#888', label: level };

  return (
    <View style={[styles.complianceLevelBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.complianceLevelText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function getRiskColor(level: string) {
  switch (level) {
    case 'critical': return '#DC2626';
    case 'high': return BrandColors.error;
    case 'medium': return BrandColors.warning;
    case 'low': return BrandColors.success;
    default: return '#94A3B8';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56,
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: Spacing.xl,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  scoreRing: {},
  scoreRingGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  scoreInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#1B2A4A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.extrabold,
    color: '#fff',
  },
  scorePercent: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
    marginTop: 4,
  },
  scoreMeta: {
    flex: 1,
    gap: Spacing.sm,
  },
  scoreStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreStatValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#fff',
    width: 24,
  },
  scoreStatLabel: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  filterRow: { marginBottom: Spacing.base },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: BrandColors.accent,
    borderColor: BrandColors.accent,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    color: '#64748B',
    fontWeight: Typography.weights.medium,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  riskStripe: {
    width: 4,
  },
  recordContent: {
    flex: 1,
    padding: Spacing.base,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  recordInfo: { flex: 1 },
  recordCode: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: BrandColors.accent,
    marginBottom: 2,
  },
  recordName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: '#1A1A2E',
  },
  riskBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskBadgeText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.extrabold,
  },
  riskBarContainer: {
    marginBottom: Spacing.md,
  },
  riskBarTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  recordBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evidenceText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: Typography.sizes.xs,
    color: '#64748B',
  },
  complianceLevelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  complianceLevelText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
});
