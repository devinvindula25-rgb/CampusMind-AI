import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import type { ResearchProject, Publication, ConferenceEvent } from '@/services/firestoreTypes';
import { updateResearchProject } from '@/services/firestore';


const EVENT_STATUS_COLORS: Record<string, { bg: string, text: string, label: string }> = {
  upcoming: { bg: '#DBEAFE', text: '#2563EB', label: 'Upcoming' },
  attended: { bg: '#D1FAE5', text: '#059669', label: 'Attended' },
  presented: { bg: '#FEE2E2', text: '#DC2626', label: 'Presented' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Cancelled' }
};

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  Typography: any;
}

// ─── Project Details Modal ──────────────────────────────────────────
export function ProjectDetailsModal({ visible, onClose, isDark, Typography, project }: ModalProps & { project: ResearchProject | null }) {
  if (!project) return null;

  const handleUpdateStatus = () => {
    Alert.alert('Update Status', 'Select new project status:', [
      { text: 'Proposed', onPress: () => { project.id && updateResearchProject(project.id, { status: 'proposed' }); onClose(); } },
      { text: 'Active', onPress: () => { project.id && updateResearchProject(project.id, { status: 'active' }); onClose(); } },
      { text: 'Completed', onPress: () => { project.id && updateResearchProject(project.id, { status: 'completed' }); onClose(); } },
      { text: 'Paused', onPress: () => { project.id && updateResearchProject(project.id, { status: 'paused' }); onClose(); } },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{project.status.toUpperCase()}</Text>
            </View>
            
            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>{project.title}</Text>
            
            {project.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Description</Text>
                <Text style={styles.notesText}>{project.description}</Text>
              </View>
            )}

            {project.grant && project.grant.title && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Grant Details</Text>
                <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                  <Text style={[styles.infoBoxText, isDark && { color: '#fff' }]}>{project.grant.title}</Text>
                  <Text style={{ fontSize: 13, color: BrandColors.success, marginTop: 4, fontWeight: 'bold' }}>Status: {project.grant.status.toUpperCase()}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.section}>
              <View style={styles.progressHeader}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Overall Progress</Text>
                <Text style={styles.progressValue}>{project.progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient 
                  colors={[BrandColors.accent, BrandColors.secondary]} 
                  style={[styles.progressFill, { width: `${project.progress}%` }]} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                />
              </View>
            </View>

            {project.predictedDelay !== null && project.predictedDelay > 0 && (
              <View style={styles.aiWarningBox}>
                <MaterialIcons name="smart-toy" size={20} color={BrandColors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiWarningTitle}>AI Insight</Text>
                  <Text style={styles.aiWarningText}>
                    Based on your current velocity and upcoming teaching load, AI predicts a {project.predictedDelay}-day delay. Consider dedicating a deep-work block to research writing this week.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.gridSection}>
              <View style={[styles.gridItem, isDark && styles.gridItemDark]}>
                <MaterialIcons name="event" size={20} color="#94A3B8" />
                <Text style={[styles.gridValue, isDark && { color: '#fff' }]}>{project.deadline}</Text>
                <Text style={styles.gridLabel}>Deadline</Text>
              </View>
              <View style={[styles.gridItem, isDark && styles.gridItemDark]}>
                <MaterialIcons name="account-balance" size={20} color="#94A3B8" />
                <Text style={[styles.gridValue, isDark && { color: '#fff' }]}>{project.grant?.amount || 'N/A'}</Text>
                <Text style={styles.gridLabel}>Grant Funding</Text>
              </View>
              <View style={[styles.gridItem, isDark && styles.gridItemDark]}>
                <MaterialIcons name="policy" size={20} color="#94A3B8" />
                <Text style={[styles.gridValue, isDark && { color: '#fff' }]}>
                  {project.ethics === 'approved' ? 'Approved' : 'Pending'}
                </Text>
                <Text style={styles.gridLabel}>Ethics</Text>
              </View>
              <View style={[styles.gridItem, isDark && styles.gridItemDark]}>
                <MaterialIcons name="article" size={20} color="#94A3B8" />
                <Text style={[styles.gridValue, isDark && { color: '#fff' }]}>{project.publications}</Text>
                <Text style={styles.gridLabel}>Publications</Text>
              </View>
              <View style={[styles.gridItem, isDark && styles.gridItemDark]}>
                <MaterialIcons name="groups" size={20} color="#94A3B8" />
                <Text style={[styles.gridValue, isDark && { color: '#fff' }]}>{project.conferences}</Text>
                <Text style={styles.gridLabel}>Conferences</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleUpdateStatus}>
              <Text style={styles.actionButtonText}>Update Project Status</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Publication Details Modal ──────────────────────────────────────
const PUB_STAGES = ['draft', 'submitted', 'under_review', 'accepted', 'published'];

export function PublicationDetailsModal({ visible, onClose, isDark, Typography, pub }: ModalProps & { pub: Publication | null }) {
  if (!pub) return null;

  const currentStageIndex = PUB_STAGES.indexOf(pub.status);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={[styles.centeredModalContent, isDark && styles.modalContentDark]}>
          <TouchableOpacity style={styles.closeButtonCentered} onPress={onClose}>
            <MaterialIcons name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
          
          <View style={styles.pubIconCircle}>
            <MaterialIcons name="menu-book" size={28} color="#fff" />
          </View>
          
          <Text style={[styles.pubTitleCentered, isDark && { color: '#fff' }]}>{pub.title}</Text>
          <Text style={styles.pubJournalText}>{pub.journal} • {pub.year}</Text>

          {pub.doi && (
            <View style={styles.doiContainer}>
              <MaterialIcons name="link" size={16} color={BrandColors.accent} />
              <Text style={styles.doiText}>{pub.doi}</Text>
            </View>
          )}

          <View style={styles.pipelineContainer}>
            {PUB_STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <View key={stage} style={styles.pipelineStep}>
                  <View style={[
                    styles.pipelineDot,
                    isCompleted ? styles.pipelineDotActive : (isDark && styles.pipelineDotDark),
                    isCurrent && styles.pipelineDotCurrent
                  ]} />
                  {idx < PUB_STAGES.length - 1 && (
                    <View style={[styles.pipelineLine, isCompleted && styles.pipelineLineActive, isDark && !isCompleted && styles.pipelineLineDark]} />
                  )}
                  <Text style={[
                    styles.pipelineText, 
                    isCurrent && styles.pipelineTextCurrent,
                    isDark && !isCurrent && { color: '#64748B' }
                  ]}>
                    {stage.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.authorsContainer}>
            <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Co-Authors</Text>
            <View style={styles.authorChips}>
              {pub.coAuthors && pub.coAuthors.length > 0 ? pub.coAuthors.map((author, idx) => (
                <View key={idx} style={[styles.authorChip, isDark && styles.authorChipDark]}>
                  <Text style={styles.authorChipText}>{author}</Text>
                </View>
              )) : (
                <Text style={styles.noDataText}>No co-authors listed</Text>
              )}
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Conference Details Modal ───────────────────────────────────────
export function ConferenceDetailsModal({ visible, onClose, isDark, Typography, conf }: ModalProps & { conf: ConferenceEvent | null }) {
  if (!conf) return null;

  const statusStyle = EVENT_STATUS_COLORS[conf.status] || EVENT_STATUS_COLORS.upcoming;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, alignSelf: 'flex-start' }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label.toUpperCase()}</Text>
            </View>

            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>{conf.title}</Text>
            
            <View style={styles.ticketSection}>
              <View style={styles.ticketRow}>
                <MaterialIcons name="event" size={20} color="#64748B" />
                <View style={styles.ticketCol}>
                  <Text style={styles.ticketLabel}>Date</Text>
                  <Text style={[styles.ticketValue, isDark && { color: '#fff' }]}>{conf.date} {conf.endDate ? `- ${conf.endDate}` : ''}</Text>
                </View>
              </View>
              <View style={styles.ticketDivider} />
              <View style={styles.ticketRow}>
                <MaterialIcons name="location-on" size={20} color="#64748B" />
                <View style={styles.ticketCol}>
                  <Text style={styles.ticketLabel}>Location</Text>
                  <Text style={[styles.ticketValue, isDark && { color: '#fff' }]}>{conf.location || 'TBA'}</Text>
                </View>
              </View>
              <View style={styles.ticketDivider} />
              <View style={styles.ticketRow}>
                <MaterialIcons name="badge" size={20} color="#64748B" />
                <View style={styles.ticketCol}>
                  <Text style={styles.ticketLabel}>Role</Text>
                  <Text style={[styles.ticketValue, isDark && { color: '#fff' }, { textTransform: 'capitalize' }]}>{conf.role}</Text>
                </View>
              </View>
            </View>

            {conf.paperTitle && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Presentation Title</Text>
                <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                  <Text style={[styles.infoBoxText, isDark && { color: '#fff' }]}>{conf.paperTitle}</Text>
                </View>
              </View>
            )}

            {conf.notes && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Notes</Text>
                <Text style={styles.notesText}>{conf.notes}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.outlineButton} onPress={onClose}>
              <MaterialIcons name="calendar-today" size={18} color={BrandColors.accent} />
              <Text style={styles.outlineButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
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
  overlayBg: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
    paddingBottom: Spacing.xl,
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: Spacing.md,
    padding: 4,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  statusBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.xl,
    lineHeight: 32,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressValue: {
    fontWeight: 'bold',
    color: BrandColors.accent,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  aiWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.warning,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  aiWarningTitle: {
    fontWeight: 'bold',
    color: '#B45309',
    marginBottom: 4,
  },
  aiWarningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  gridSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  gridItemDark: {
    backgroundColor: '#334155',
  },
  gridValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  actionButton: {
    backgroundColor: BrandColors.accent,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: 8,
  },
  outlineButtonText: {
    color: BrandColors.accent,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Centered Modal
  centeredModalContent: {
    backgroundColor: '#fff',
    margin: Spacing.xl,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  closeButtonCentered: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 8,
  },
  pubIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  pubTitleCentered: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  pubJournalText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.md,
  },
  doiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: Spacing.xl,
  },
  doiText: {
    color: BrandColors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  pipelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  pipelineStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  pipelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
    zIndex: 2,
  },
  pipelineDotDark: {
    backgroundColor: '#475569',
  },
  pipelineDotActive: {
    backgroundColor: BrandColors.secondary,
  },
  pipelineDotCurrent: {
    borderWidth: 3,
    borderColor: BrandColors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pipelineLine: {
    position: 'absolute',
    top: 5,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  pipelineLineDark: {
    backgroundColor: '#475569',
  },
  pipelineLineActive: {
    backgroundColor: BrandColors.secondary,
  },
  pipelineText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  pipelineTextCurrent: {
    color: BrandColors.accent,
    fontWeight: 'bold',
  },
  authorsContainer: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  authorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  authorChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  authorChipDark: {
    backgroundColor: '#334155',
  },
  authorChipText: {
    fontSize: 12,
    color: '#475569',
  },
  noDataText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Conference Modal
  ticketSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ticketCol: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  infoBox: {
    backgroundColor: '#F1F5F9',
    padding: Spacing.md,
    borderRadius: 12,
  },
  infoBoxDark: {
    backgroundColor: '#334155',
  },
  infoBoxText: {
    color: '#334155',
    lineHeight: 22,
  },
  notesText: {
    color: '#64748B',
    lineHeight: 22,
  }
});
