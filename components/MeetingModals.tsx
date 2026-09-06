import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import type { Meeting } from '@/services/firestoreTypes';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  Typography: any;
  meeting: Meeting | null;
  onToggleStatus?: (meeting: Meeting) => void;
}

export function MeetingDetailsModal({ visible, onClose, isDark, Typography, meeting, onToggleStatus }: ModalProps) {
  if (!meeting) return null;

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'in_person': return { label: 'In-Person', icon: 'meeting-room' as const, color: '#3B82F6' };
      case 'virtual': return { label: 'Virtual', icon: 'videocam' as const, color: '#8B5CF6' };
      case 'hybrid': return { label: 'Hybrid', icon: 'devices' as const, color: '#10B981' };
      default: return { label: type, icon: 'event' as const, color: '#64748B' };
    }
  };

  const typeConfig = getTypeConfig(meeting.type);
  const isCompleted = meeting.status === 'completed';

  const handleToggle = () => {
    if (onToggleStatus) onToggleStatus(meeting);
    onClose();
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
            
            {/* Header / Type Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '18' }]}>
                <MaterialIcons name={typeConfig.icon} size={14} color={typeConfig.color} />
                <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
              </View>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <MaterialIcons name="check-circle" size={14} color={BrandColors.success} />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </View>

            {/* Title & Schedule */}
            <Text style={[styles.modalTitle, isDark && { color: '#fff' }]}>{meeting.title}</Text>
            
            <View style={styles.timeLocationRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={16} color="#64748B" />
                <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}>{meeting.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="schedule" size={16} color="#64748B" />
                <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}>{meeting.startTime} - {meeting.endTime}</Text>
              </View>
              {meeting.room && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="meeting-room" size={16} color="#64748B" />
                  <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}>{meeting.room}</Text>
                </View>
              )}
            </View>

            {meeting.teamsLink && (
              <TouchableOpacity style={styles.joinButton}>
                <MaterialIcons name="videocam" size={18} color="#fff" />
                <Text style={styles.joinButtonText}>Join Meeting Link</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {/* Participants */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Participants ({meeting.attendees.length})</Text>
              <View style={styles.attendeesContainer}>
                {meeting.attendees.map((attendee, idx) => (
                  <View key={idx} style={[styles.attendeeChip, isDark && styles.attendeeChipDark]}>
                    <View style={styles.attendeeAvatar}>
                      <Text style={styles.attendeeInitials}>{attendee.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.attendeeName, isDark && { color: '#E2E8F0' }]}>{attendee}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Agenda */}
            {meeting.agenda && meeting.agenda.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Agenda</Text>
                <View style={[styles.agendaContainer, isDark && styles.agendaContainerDark]}>
                  {meeting.agenda.map((item, idx) => (
                    <View key={idx} style={styles.agendaItemRow}>
                      <MaterialIcons name="radio-button-unchecked" size={16} color={BrandColors.accent} />
                      <Text style={[styles.agendaItemText, isDark && { color: '#CBD5E1' }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Minutes / Notes */}
            {meeting.minutes && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && { color: '#E2E8F0' }]}>Meeting Minutes</Text>
                <View style={[styles.minutesBox, isDark && styles.minutesBoxDark]}>
                  <Text style={[styles.minutesText, isDark && { color: '#fff' }]}>{meeting.minutes}</Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.outlineButton, isCompleted && styles.outlineButtonDanger]} 
              onPress={handleToggle}
            >
              <MaterialIcons 
                name={isCompleted ? "restore" : "check-circle"} 
                size={18} 
                color={isCompleted ? BrandColors.error : BrandColors.accent} 
              />
              <Text style={[styles.outlineButtonText, isCompleted && { color: BrandColors.error }]}>
                {isCompleted ? 'Mark as Not Completed' : 'Mark as Completed'}
              </Text>
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
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: BrandColors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.md,
    lineHeight: 32,
  },
  timeLocationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.accent,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: 8,
    marginBottom: Spacing.md,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.md,
  },
  attendeesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  attendeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 6,
    paddingRight: 12,
    borderRadius: 20,
    gap: 8,
  },
  attendeeChipDark: {
    backgroundColor: '#334155',
  },
  attendeeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeInitials: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  attendeeName: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  agendaContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  agendaContainerDark: {
    backgroundColor: '#0F172A',
  },
  agendaItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  agendaItemText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  minutesBox: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  minutesBoxDark: {
    backgroundColor: '#451A03',
    borderLeftColor: '#D97706',
  },
  minutesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
  },
  outlineButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BrandColors.accent,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButtonDanger: {
    borderColor: BrandColors.error,
  },
  outlineButtonText: {
    color: BrandColors.accent,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
