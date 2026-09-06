
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BrandColors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import type { CommitteeMembership, CommitteeType } from '@/services/firestoreTypes';

interface CommitteeDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  committee: CommitteeMembership | null;
}

const COMMITTEE_LABELS: Record<CommitteeType, string> = {
  board_of_management: 'Board of Management',
  board_of_study: 'Board of Study',
  specialty_board: 'Specialty Board',
  aaaec: 'AAAEC',
  ethics_review: 'Ethics Review',
  finance_management: 'Finance & Management',
  audit: 'Audit Committee',
  grievance: 'Grievance Committee',
  inquiry_disciplinary: 'Inquiry & Disciplinary',
  examination_board: 'Examination Board',
  iqac: 'Internal Quality Assurance',
  subcommittee_adhoc: 'Ad-hoc Sub Committee',
};

export default function CommitteeDetailsModal({ visible, onClose, committee }: CommitteeDetailsModalProps) {
  const router = useRouter();

  if (!committee) return null;

  const progress = committee.totalMeetings > 0 ? (committee.meetingsAttended / committee.totalMeetings) : 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <LinearGradient colors={['#0EA5E9', '#2563EB']} style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{committee.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.committeeType}>{COMMITTEE_LABELS[committee.committeeType]}</Text>
            <Text style={styles.committeeName}>{committee.committeeName}</Text>
            
            <View style={styles.headerStatsRow}>
              <View style={styles.roleBadge}>
                <MaterialIcons name="person" size={14} color="#fff" />
                <Text style={styles.roleText}>{committee.role.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <Text style={styles.dateText}>Since {committee.startDate}</Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Attendance Progress */}
            <View style={styles.section}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.sectionTitle}>Your Attendance</Text>
                <Text style={styles.attendanceValue}>{committee.meetingsAttended}/{committee.totalMeetings} ({Math.round(progress * 100)}%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              
              {committee.attendanceRecords && committee.attendanceRecords.length > 0 && (
                <View style={styles.attendanceRecordsContainer}>
                  {committee.attendanceRecords.map((record, i) => (
                    <View key={i} style={styles.attendanceRecordRow}>
                      <View style={styles.attendanceDateCol}>
                        <MaterialIcons name="event" size={14} color="#64748B" />
                        <Text style={styles.attendanceDateText}>{record.date}</Text>
                      </View>
                      <View style={styles.attendanceDetailsCol}>
                        <View style={[
                          styles.attendanceStatusBadge,
                          { backgroundColor: record.status === 'present' ? '#D1FAE5' : record.status === 'absent' ? '#FEE2E2' : '#FEF3C7' }
                        ]}>
                          <Text style={[
                            styles.attendanceStatusText,
                            { color: record.status === 'present' ? '#059669' : record.status === 'absent' ? '#DC2626' : '#D97706' }
                          ]}>
                            {record.status.toUpperCase()}
                          </Text>
                        </View>
                        {record.type === 'special' && (
                          <View style={styles.specialBadge}>
                            <Text style={styles.specialBadgeText}>SPECIAL</Text>
                          </View>
                        )}
                      </View>
                      {record.notes && (
                        <Text style={styles.attendanceNotes}>{record.notes}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Governance & SLQF Standards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Governance & Standards</Text>
              <View style={styles.slqfCard}>
                <View style={styles.slqfHeader}>
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text style={styles.slqfTitle}>SLQF Alignment</Text>
                </View>
                <Text style={styles.slqfDesc}>{committee.slqfAlignment || 'General university operational alignment.'}</Text>
              </View>
              {committee.description && (
                <View style={styles.descCard}>
                  <Text style={styles.descTitle}>Terms of Reference (ToR)</Text>
                  <Text style={styles.descText}>{committee.description}</Text>
                </View>
              )}
            </View>

            {/* Recent Decisions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Decisions & Agenda</Text>
              {committee.recentDecisions && committee.recentDecisions.length > 0 ? (
                committee.recentDecisions.map((dec, i) => (
                  <View key={i} style={styles.decisionCard}>
                    <View style={styles.decisionTop}>
                      <Text style={styles.decisionTitle}>{dec.title}</Text>
                      <View style={[styles.outcomeBadge, 
                        { backgroundColor: dec.outcome === 'approved' ? '#D1FAE5' : dec.outcome === 'rejected' ? '#FEE2E2' : '#FEF3C7' }
                      ]}>
                        <Text style={[styles.outcomeText, 
                          { color: dec.outcome === 'approved' ? '#059669' : dec.outcome === 'rejected' ? '#DC2626' : '#D97706' }
                        ]}>
                          {dec.outcome.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.decisionDate}>{dec.date}</Text>
                    <Text style={styles.decisionDesc}>{dec.description}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent decisions recorded.</Text>
              )}
            </View>

            {/* Key Members */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Members</Text>
              {committee.members && committee.members.length > 0 ? (
                committee.members.map((member, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.memberCard} 
                    activeOpacity={0.7}
                    onPress={() => {
                      const idToUse = member.userId || `mock_${member.email?.split('@')[0] || member.name.toLowerCase().replace(/[^a-z]/g, '')}`;
                      onClose();
                      router.push(`/directory/faculty/${idToUse}`);
                    }}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitials}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {member.email && <Text style={styles.memberEmail}>{member.email}</Text>}
                    </View>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Member list not available.</Text>
              )}

            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.downloadBtn]}
                onPress={() => {
                  const msg = `Download meeting minutes for ${committee.committeeName}?`;
                  if (Platform.OS === 'web') {
                    if (window.confirm(msg)) onClose();
                  } else {
                    Alert.alert('Confirm Download', msg, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Download', onPress: onClose }
                    ]);
                  }
                }}
              >
                <MaterialIcons name="file-download" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Download Minutes</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
  },
  committeeType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  committeeName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: Spacing.md,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  attendanceRecordsContainer: {
    marginTop: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  attendanceRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attendanceDateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  attendanceDateText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '600',
  },
  attendanceDetailsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  attendanceStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  attendanceStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  specialBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  specialBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  attendanceNotes: {
    width: '100%',
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
    paddingLeft: 22,
  },
  slqfCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  slqfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  slqfTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
  },
  slqfDesc: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 20,
  },
  descCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  decisionCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    ...Shadows.sm,
  },
  decisionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  decisionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  decisionDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  decisionDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: Spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  downloadBtn: {
    backgroundColor: BrandColors.primary,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
