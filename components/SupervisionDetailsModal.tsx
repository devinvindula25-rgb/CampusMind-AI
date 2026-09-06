import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BrandColors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import type { SupervisionRecord } from '@/services/firestoreTypes';

interface SupervisionDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  record: SupervisionRecord | null;
}

export default function SupervisionDetailsModal({ visible, onClose, record }: SupervisionDetailsModalProps) {
  const router = useRouter();

  if (!record) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <LinearGradient colors={['#059669', '#047857']} style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{record.studentLevel.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.studentName}>{record.studentName}</Text>
            <Text style={styles.thesisTitle}>{record.thesisTitle}</Text>
            
            <View style={styles.headerStatsRow}>
              <View style={styles.roleBadge}>
                <MaterialIcons name="school" size={14} color="#fff" />
                <Text style={styles.roleText}>{record.role === 'supervisor' ? 'Primary Supervisor' : 'Co-supervisor'}</Text>
              </View>
              {record.funding && (
                <Text style={styles.fundingText}>💰 {record.funding}</Text>
              )}
            </View>
          </LinearGradient>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Research Overview */}
            {record.abstract && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Research Overview</Text>
                <View style={styles.abstractCard}>
                  <MaterialIcons name="format-quote" size={24} color="#CBD5E1" style={styles.quoteIcon} />
                  <Text style={styles.abstractText}>{record.abstract}</Text>
                </View>
              </View>
            )}

            {/* Meeting Logs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supervision Logs</Text>
              {record.meetingLogs && record.meetingLogs.length > 0 ? (
                record.meetingLogs.map((log, i) => (
                  <View key={i} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <View style={styles.logDateRow}>
                        <MaterialIcons name="event" size={16} color="#64748B" />
                        <Text style={styles.logDate}>{log.date}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: log.status === 'completed' ? '#D1FAE5' : '#E0E7FF' }]}>
                        <Text style={[styles.statusText, { color: log.status === 'completed' ? '#059669' : '#4F46E5' }]}>
                          {log.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logTopic}>{log.topic}</Text>
                    <View style={styles.logActionRow}>
                      <MaterialIcons name="subdirectory-arrow-right" size={16} color="#94A3B8" />
                      <Text style={styles.logAction}>{log.nextSteps}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No meeting logs recorded.</Text>
              )}
            </View>

            {/* Publications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Publications & Outputs</Text>
              {record.publications && record.publications.length > 0 ? (
                record.publications.map((pub, i) => (
                  <View key={i} style={styles.pubCard}>
                    <View style={styles.pubIcon}>
                      <MaterialIcons name="article" size={20} color="#059669" />
                    </View>
                    <View style={styles.pubInfo}>
                      <Text style={styles.pubTitle}>{pub.title}</Text>
                      <Text style={styles.pubVenue}>{pub.venue} • {pub.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: pub.status === 'published' ? '#D1FAE5' : pub.status === 'under_review' ? '#FEF3C7' : '#F1F5F9' }]}>
                      <Text style={[styles.statusText, { color: pub.status === 'published' ? '#059669' : pub.status === 'under_review' ? '#D97706' : '#64748B' }]}>
                        {pub.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No publications linked.</Text>
              )}
            </View>

            {/* Supervisory Team */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supervisory Team</Text>
              {record.coSupervisors && record.coSupervisors.length > 0 ? (
                record.coSupervisors.map((member, i) => (
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
                <Text style={styles.emptyText}>You are the sole supervisor.</Text>
              )}
            </View>


            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => {
                  const msg = `Schedule a meeting with ${record.studentName}?`;
                  if (Platform.OS === 'web') {
                    if (window.confirm(msg)) onClose();
                  } else {
                    Alert.alert('Schedule Meeting', msg, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Confirm', onPress: onClose }
                    ]);
                  }
                }}
              >
                <MaterialIcons name="event" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Schedule Meeting</Text>
              </TouchableOpacity>
              
              {record.thesisSubmission === 'submitted' && (
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.submitBtn]}
                  onPress={() => {
                    const msg = `Approve thesis for ${record.studentName}?`;
                    if (Platform.OS === 'web') {
                      if (window.confirm(msg)) onClose();
                    } else {
                      Alert.alert('Confirm Approval', msg, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Approve', onPress: onClose }
                      ]);
                    }
                  }}
                >
                  <MaterialIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve Thesis</Text>
                </TouchableOpacity>
              )}
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
  studentName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  thesisTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  fundingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  abstractCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    opacity: 0.2,
  },
  abstractText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    zIndex: 1,
  },
  logCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    ...Shadows.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  logTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  logActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: BorderRadius.sm,
  },
  logAction: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
  pubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  pubIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pubInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  pubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  pubVenue: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
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
    marginRight: Spacing.sm,
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
  submitBtn: {
    backgroundColor: BrandColors.success,
  },
  approveBtn: {
    backgroundColor: BrandColors.primary,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
