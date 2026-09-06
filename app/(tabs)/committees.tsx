/**
 * CampusMind AI - Committees Tracker
 * Track committee memberships, roles and attendance.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeCommittees, updateCommittee } from '@/services/firestore';
import type { CommitteeMembership, CommitteeType } from '@/services/firestoreTypes';
import { getMockCommitteeDetails } from '@/services/mockCommitteeData';
import CommitteeDetailsModal from '@/components/CommitteeDetailsModal';

const COMMITTEE_LABELS: Record<CommitteeType, string> = {
  board_of_management: 'Board of Management',
  board_of_study: 'Board of Study',
  specialty_board: 'Specialty Board',
  aaaec: 'AAAEC',
  ethics_review: 'Ethics Review',
  finance_management: 'Finance & Management',
  audit: 'Audit Committee',
  grievance: 'Grievance Committee',
  inquiry_disciplinary: 'Inquiry / Disciplinary',
  examination_board: 'Examination Board',
  iqac: 'IQAC',
  subcommittee_adhoc: 'Subcommittee / Ad-hoc',
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  chair: { bg: '#FEF3C7', text: '#D97706' },
  secretary: { bg: '#DBEAFE', text: '#2563EB' },
  vice_chair: { bg: '#E0E7FF', text: '#4F46E5' },
  member: { bg: '#F1F5F9', text: '#64748B' },
};

export default function CommitteesScreen() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<CommitteeMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeMembership | null>(null);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsub = subscribeCommittees(user.uid, (data) => {
      setMemberships(data);
      setLoading(false);

      // Auto-patch missing SLQF and detailed data for older Firebase records
      data.forEach(committee => {
        const needsUpdate = !committee.slqfAlignment || !committee.description || !committee.attendanceRecords || (committee.members && committee.members.length > 0 && !committee.members[0].userId);
        if (needsUpdate) {
          const updates = getMockCommitteeDetails(committee.committeeType, committee.committeeName);
          if (committee.id) {
            updateCommittee(committee.id, updates);
          }
        }
      });
    });
    return () => unsub();
  }, [user?.uid]);

  const active = memberships.filter(m => m.status === 'active');
  const completed = memberships.filter(m => m.status === 'completed');
  const totalMeetings = memberships.reduce((s, m) => s + m.meetingsAttended, 0);
  const avgAttendance = memberships.length > 0
    ? Math.round(memberships.reduce((s, m) => s + (m.totalMeetings > 0 ? (m.meetingsAttended / m.totalMeetings) * 100 : 0), 0) / memberships.length)
    : 0;

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
        <Text style={styles.headerTitle}>Committees</Text>
        <Text style={styles.headerSubtitle}>Memberships, roles & governance</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, filter === 'active' && { borderColor: BrandColors.accent, borderWidth: 1 }]} onPress={() => setFilter(filter === 'active' ? 'all' : 'active')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{active.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, filter === 'completed' && { borderColor: BrandColors.accent, borderWidth: 1 }]} onPress={() => setFilter(filter === 'completed' ? 'all' : 'completed')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{completed.length}</Text>
            <Text style={styles.statLabel}>Past</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMeetings}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgAttendance}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {(filter === 'all' || filter === 'active') && active.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Active Memberships</Text>
              {active.map((m) => <CommitteeCard key={m.id} membership={m} onPress={() => setSelectedCommittee(m)} />)}
            </>
          )}
          {(filter === 'all' || filter === 'completed') && completed.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Past Memberships</Text>
              {completed.map((m) => <CommitteeCard key={m.id} membership={m} onPress={() => setSelectedCommittee(m)} />)}
            </>
          )}
          {memberships.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <MaterialIcons name="groups" size={48} color="#CBD5E1" />
              <Text style={{ color: '#94A3B8', marginTop: 8 }}>No committee memberships yet</Text>
            </View>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      <CommitteeDetailsModal
        visible={!!selectedCommittee}
        onClose={() => setSelectedCommittee(null)}
        committee={selectedCommittee}
      />
    </View>
  );
}

function CommitteeCard({ membership, onPress }: { membership: CommitteeMembership, onPress: () => void }) {
  const attendance = membership.totalMeetings > 0
    ? Math.round((membership.meetingsAttended / membership.totalMeetings) * 100)
    : 0;
  const roleStyle = ROLE_COLORS[membership.role] || ROLE_COLORS.member;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialIcons name="groups" size={22} color="#0EA5E9" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{membership.committeeName}</Text>
          <Text style={styles.cardType}>{COMMITTEE_LABELS[membership.committeeType] || membership.committeeType}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: roleStyle.text }}>
            {membership.role.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceSection}>
        <View style={styles.attendanceHeader}>
          <Text style={styles.attendanceLabel}>Attendance</Text>
          <Text style={styles.attendanceValue}>{membership.meetingsAttended}/{membership.totalMeetings} ({attendance}%)</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={attendance >= 75 ? ['#10B981', '#059669'] : attendance >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
            style={[styles.progressFill, { width: `${Math.min(attendance, 100)}%` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={14} color="#64748B" />
          <Text style={styles.dateText}>Since {membership.startDate}</Text>
        </View>
        {membership.status === 'active' && (
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 2 },
  statValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold, color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: Spacing.md },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  cardIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: '#0EA5E915', justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  cardType: { fontSize: Typography.sizes.xs, color: '#64748B', marginTop: 2 },
  roleBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  attendanceSection: { marginBottom: Spacing.md },
  attendanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  attendanceLabel: { fontSize: Typography.sizes.sm, color: '#64748B' },
  attendanceValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: Typography.sizes.xs, color: '#64748B' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
