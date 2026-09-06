/**
 * CampusMind AI - Student Supervision Tracker
 * Track postgraduate and undergraduate supervision.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeSupervisions, updateSupervision } from '@/services/firestore';
import type { SupervisionRecord } from '@/services/firestoreTypes';
import { getMockSupervisionDetails } from '@/services/mockSupervisionData';
import SupervisionDetailsModal from '@/components/SupervisionDetailsModal';

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  completed: '#10B981', pending: '#F59E0B', overdue: '#EF4444',
};

export default function SupervisionScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'postgrad' | 'undergrad'>('postgrad');
  const [records, setRecords] = useState<SupervisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<SupervisionRecord | null>(null);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsub = subscribeSupervisions(user.uid, (data) => {
      setRecords(data);
      setLoading(false);

      // Auto-patch missing detailed data
      data.forEach(record => {
        if (!record.abstract) {
          const updates = getMockSupervisionDetails(record.studentLevel, record.studentName);
          if (record.id) {
            updateSupervision(record.id, updates);
          }
        }
      });
    });
    return () => unsub();
  }, [user?.uid]);

  const postgrad = records.filter(r => r.studentLevel === 'postgraduate' || r.studentLevel === 'doctoral');
  const undergrad = records.filter(r => r.studentLevel === 'undergraduate');
  const activeRecords = records.filter(r => r.status === 'active');
  const totalPubs = records.reduce((s, r) => s + (r.publications?.length || 0), 0);

  const filtered = activeTab === 'postgrad' ? postgrad : undergrad;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#047857']} style={styles.header}>
        <Text style={styles.headerTitle}>Supervision</Text>
        <Text style={styles.headerSubtitle}>Postgraduate & undergraduate students</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeRecords.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => setActiveTab('postgrad')}>
            <Text style={styles.statValue}>{postgrad.length}</Text>
            <Text style={styles.statLabel}>Postgrad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => setActiveTab('undergrad')}>
            <Text style={styles.statValue}>{undergrad.length}</Text>
            <Text style={styles.statLabel}>Undergrad</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPubs}</Text>
            <Text style={styles.statLabel}>Pubs</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'postgrad' && styles.tabActive]} onPress={() => setActiveTab('postgrad')}>
          <Text style={[styles.tabText, activeTab === 'postgrad' && styles.tabTextActive]}>Postgraduate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'undergrad' && styles.tabActive]} onPress={() => setActiveTab('undergrad')}>
          <Text style={[styles.tabText, activeTab === 'undergrad' && styles.tabTextActive]}>Undergraduate</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.map((record) => (
            <TouchableOpacity 
              key={record.id} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => setSelectedStudent(record)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>{record.studentName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{record.studentName}</Text>
                  <Text style={styles.roleBadgeText}>
                    {record.role === 'supervisor' ? '🎓 Supervisor' : '🤝 Co-supervisor'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: record.status === 'active' ? '#D1FAE5' : record.status === 'completed' ? '#DBEAFE' : '#FEF3C7'
                }]}>
                  <Text style={{
                    fontSize: 10, fontWeight: '700',
                    color: record.status === 'active' ? '#059669' : record.status === 'completed' ? '#2563EB' : '#D97706'
                  }}>
                    {record.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.thesisTitle}>{record.thesisTitle}</Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <MaterialIcons name="event" size={14} color="#64748B" />
                  <Text style={styles.metricValue}>{record.meetingsCount}</Text>
                  <Text style={styles.metricLabel}>Meetings</Text>
                </View>
                <View style={styles.metricItem}>
                  <MaterialIcons name="description" size={14} color="#64748B" />
                  <Text style={styles.metricValue}>{record.progressReports}</Text>
                  <Text style={styles.metricLabel}>Reports</Text>
                </View>
                <View style={styles.metricItem}>
                  <MaterialIcons name="article" size={14} color="#64748B" />
                  <Text style={styles.metricValue}>{record.publications?.length || 0}</Text>
                  <Text style={styles.metricLabel}>Pubs</Text>
                </View>
              </View>

              {/* Status Badges Row */}
              <View style={styles.badgesRow}>
                <StatusPill label="Proposal" status={record.researchProposal} />
                <StatusPill label="Ethics" status={record.ethicsApproval} />
                <StatusPill label="Thesis" status={record.thesisSubmission} />
                {record.vivaStatus && <StatusPill label="Viva" status={record.vivaStatus} />}
              </View>

              {/* Milestones Timeline */}
              {(record.milestones || []).length > 0 && (
                <View style={styles.milestonesSection}>
                  <Text style={styles.sectionLabel}>MILESTONES</Text>
                  {(record.milestones || []).map((ms, i) => (
                    <View key={i} style={styles.milestoneRow}>
                      <View style={[styles.milestoneDot, { backgroundColor: MILESTONE_STATUS_COLORS[ms.status] || '#94A3B8' }]} />
                      {i < (record.milestones || []).length - 1 && <View style={styles.milestoneLine} />}
                      <View style={styles.milestoneContent}>
                        <Text style={styles.milestoneTitle}>{ms.title}</Text>
                        <Text style={styles.milestoneDate}>{ms.dueDate}</Text>
                      </View>
                      <View style={[styles.msBadge, {
                        backgroundColor: ms.status === 'completed' ? '#D1FAE5' : ms.status === 'overdue' ? '#FEE2E2' : '#FEF3C7'
                      }]}>
                        <Text style={{
                          fontSize: 9, fontWeight: '700',
                          color: ms.status === 'completed' ? '#059669' : ms.status === 'overdue' ? '#DC2626' : '#D97706',
                        }}>
                          {ms.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <MaterialIcons name="school" size={48} color="#CBD5E1" />
              <Text style={{ color: '#94A3B8', marginTop: 8 }}>
                No {activeTab === 'postgrad' ? 'postgraduate' : 'undergraduate'} students yet
              </Text>
            </View>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      <SupervisionDetailsModal 
        visible={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        record={selectedStudent} 
      />
    </View>
  );
}

function StatusPill({ label, status }: { label: string; status: string }) {
  const isGood = ['approved', 'passed', 'submitted'].includes(status);
  const isBad = ['rejected', 'failed', 'overdue'].includes(status);
  const bg = isGood ? '#D1FAE5' : isBad ? '#FEE2E2' : '#F1F5F9';
  const color = isGood ? '#059669' : isBad ? '#DC2626' : '#64748B';

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 9, fontWeight: '700', color }}>{label}: {status.replace(/_/g, ' ')}</Text>
    </View>
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
  tabContainer: { flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: '#05966918' },
  tabText: { fontSize: Typography.sizes.md, color: '#64748B', fontWeight: Typography.weights.medium },
  tabTextActive: { color: '#059669', fontWeight: Typography.weights.bold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  studentAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff' },
  studentName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  roleBadgeText: { fontSize: Typography.sizes.xs, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  thesisTitle: { fontSize: Typography.sizes.sm, color: '#475569', fontStyle: 'italic', marginBottom: Spacing.md, lineHeight: 20 },
  metricsRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, padding: Spacing.md, justifyContent: 'space-around', marginBottom: Spacing.md },
  metricItem: { alignItems: 'center', gap: 2 },
  metricValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  metricLabel: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  milestonesSection: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: Spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: Spacing.sm },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, position: 'relative' },
  milestoneDot: { width: 10, height: 10, borderRadius: 5 },
  milestoneLine: { position: 'absolute', left: 4, top: 14, width: 2, height: 20, backgroundColor: '#E2E8F0' },
  milestoneContent: { flex: 1 },
  milestoneTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: '#1A1A2E' },
  milestoneDate: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  msBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});
