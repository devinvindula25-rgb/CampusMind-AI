/**
 * CampusMind AI - Accreditation Tracker
 * Countdown trackers and milestone management for educational accreditations.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeAccreditation } from '@/services/firestore';
import type { AccreditationRecord } from '@/services/firestoreTypes';
import { getMockSLQFAccreditation } from '@/services/mockAccreditationData';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import GlassCard from '@/components/GlassCard';
import AccreditationDetailsModal from '@/components/AccreditationDetailsModal';

export default function AccreditationScreen() {
  const { resolvedTheme } = useSettings();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';
  const [accreditations, setAccreditations] = useState<AccreditationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccreditation, setSelectedAccreditation] = useState<AccreditationRecord | null>(null);

  React.useEffect(() => {
    const departmentId = 'cs-dept';
    const unsub = subscribeAccreditation(departmentId, async (data) => {
      let needsUpdate = false;
      const patchedData = await Promise.all(data.map(async (acc) => {
        // Auto-patch: if no slqfLevel or standards missing rich fields, upgrade it
        if (!acc.slqfLevel || !acc.standards || (acc.standards.length > 0 && !acc.standards[0].description)) {
          const richData = getMockSLQFAccreditation(acc);
          try {
            await updateDoc(doc(db, 'accreditation', acc.id!), {
              standards: richData.standards,
              slqfLevel: richData.slqfLevel,
              totalCreditsRequired: richData.totalCreditsRequired,
              complianceScore: richData.complianceScore
            });
            needsUpdate = true;
          } catch (e) {
            console.error('Failed to auto-patch accreditation', e);
          }
          return richData;
        }
        return acc;
      }));

      if (!needsUpdate) {
        setAccreditations(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Active', color: BrandColors.success, bg: BrandColors.successBg };
      case 'expiring_soon': return { label: 'Expiring Soon', color: BrandColors.warning, bg: BrandColors.warningBg };
      case 'expired': return { label: 'Expired', color: BrandColors.error, bg: BrandColors.errorBg };
      case 'under_review': return { label: 'Under Review', color: BrandColors.info, bg: BrandColors.infoBg };
      default: return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>Accreditation Tracker</Text>
        <Text style={styles.headerSubtitle}>Manage accreditation milestones & deadlines</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {accreditations.map((acc) => {
          const statusConfig = getStatusConfig(acc.status);
          const standards = acc.standards || [];
          const completedCount = standards.filter((m) => m.status === 'completed' || m.status === 'met').length;
          
          const daysLeft = Math.ceil((new Date(acc.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
          const progress = acc.complianceScore || 0;

          return (
            <TouchableOpacity key={acc.id} activeOpacity={0.8} onPress={() => setSelectedAccreditation(acc)}>
              <GlassCard style={styles.card} isDark={isDark} intensity={isDark ? 30 : 90}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={[styles.bodyName, isDark && styles.textDark]}>{acc.accreditingBody}</Text>
                  <Text style={[styles.programmeName, isDark && styles.textMutedDark]}>{acc.programmeName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
              </View>

              {/* Countdown */}
              <View style={[styles.countdownRow, isDark && styles.countdownRowDark, { borderColor: statusConfig.color + (isDark ? '20' : '30') }]}>
                <MaterialIcons name="timer" size={20} color={statusConfig.color} />
                <Text style={[styles.countdownDays, { color: statusConfig.color }]}>{Math.max(0, daysLeft)}</Text>
                <Text style={[styles.countdownLabel, isDark && styles.textMutedDark]}>days remaining</Text>
                <Text style={[styles.deadlineDate, isDark && styles.textMutedDark]}>Due: {acc.expiryDate}</Text>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, isDark && styles.textMutedDark]}>Overall Progress</Text>
                  <Text style={[styles.progressPercent, isDark && styles.textDark]}>{progress}%</Text>
                </View>
                <View style={[styles.progressTrack, isDark && styles.progressTrackDark]}>
                  <LinearGradient
                    colors={[statusConfig.color, statusConfig.color + '80']}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>

              {/* Milestones / Standards */}
              <Text style={[styles.milestonesTitle, isDark && styles.textDark]}>Standards ({completedCount}/{standards.length})</Text>
              {standards.map((m, i) => {
                const done = m.status === 'completed' || m.status === 'met';
                return (
                  <View key={i} style={styles.milestoneRow}>
                    <MaterialIcons
                      name={done ? 'check-circle' : 'radio-button-unchecked'}
                      size={20}
                      color={done ? BrandColors.success : (isDark ? '#475569' : '#CBD5E1')}
                    />
                    <Text style={[styles.milestoneText, isDark && styles.textDark, done && styles.milestoneDone, isDark && done && styles.milestoneDoneDark]} numberOfLines={1}>
                      {m.code}: {m.title}
                    </Text>
                  </View>
                );
              })}
              </GlassCard>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      <AccreditationDetailsModal 
        visible={!!selectedAccreditation} 
        onClose={() => setSelectedAccreditation(null)} 
        record={selectedAccreditation} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardHeaderLeft: { flex: 1 },
  bodyName: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  programmeName: { fontSize: Typography.sizes.sm, color: '#64748B', marginTop: 2 },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.sm },
  statusText: { fontSize: 11, fontWeight: Typography.weights.bold, textTransform: 'uppercase' },
  countdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#F8FAFC',
    padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 1,
  },
  countdownRowDark: { backgroundColor: '#0F172A' },
  countdownDays: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.extrabold },
  countdownLabel: { fontSize: Typography.sizes.sm, color: '#64748B' },
  deadlineDate: { fontSize: Typography.sizes.xs, color: '#94A3B8', marginLeft: 'auto' },
  progressSection: { marginBottom: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: Typography.sizes.sm, color: '#64748B' },
  progressPercent: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressTrackDark: { backgroundColor: '#334155' },
  progressFill: { height: '100%', borderRadius: 3 },
  milestonesTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#334155', marginBottom: Spacing.sm },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  milestoneText: { fontSize: Typography.sizes.md, color: '#334155' },
  milestoneDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  milestoneDoneDark: { color: '#475569' },
});
