import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Shadows } from '@/constants/theme';
import type { ScheduleItem } from '@/services/firestoreTypes';

interface ScheduleDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  Typography: any;
  item: ScheduleItem | null;
}

export function ScheduleDetailsModal({ visible, onClose, isDark, Typography, item }: ScheduleDetailsModalProps) {
  if (!item) return null;

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'lecture_prep': return { label: 'Lecture Prep', color: '#3B82F6', icon: 'menu-book' as const };
      case 'research_writing': return { label: 'Research Writing', color: '#8B5CF6', icon: 'edit-note' as const };
      case 'student_consultations': return { label: 'Student Hours', color: '#10B981', icon: 'people' as const };
      case 'assessment_review': return { label: 'Assessment', color: '#EF4444', icon: 'grading' as const };
      case 'meetings': return { label: 'Meeting', color: '#F59E0B', icon: 'event' as const };
      case 'admin': return { label: 'Admin/Emails', color: '#64748B', icon: 'mark-email-unread' as const };
      case 'break': return { label: 'Break/Lunch', color: '#F97316', icon: 'coffee' as const };
      default: return { label: 'External Event', color: '#64748B', icon: 'event-note' as const };
    }
  };

  const config = getTypeConfig(item.type);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, isDark && styles.overlayDark]}>
        <View style={[styles.container, isDark && styles.containerDark]}>
          
          <View style={[styles.headerBanner, { backgroundColor: config.color }]} />
          
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={[styles.badge, { backgroundColor: config.color + '18' }]}>
                <MaterialIcons name={config.icon} size={14} color={config.color} />
                <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
                {item.isAI && (
                  <View style={styles.aiBadge}>
                    <MaterialIcons name="auto-awesome" size={10} color="#8B5CF6" />
                    <Text style={styles.aiText}>AI Scheduled</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.title, Typography.h2, isDark && styles.textDark]}>{item.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.row}>
                <MaterialIcons name="event" size={20} color={config.color} />
                <View style={styles.rowText}>
                  <Text style={[styles.label, isDark && styles.textDim]}>Date</Text>
                  <Text style={[styles.value, isDark && styles.textDark]}>{formatDate(item.date)}</Text>
                </View>
              </View>
              <View style={[styles.divider, isDark && styles.dividerDark]} />
              <View style={styles.row}>
                <MaterialIcons name="schedule" size={20} color={config.color} />
                <View style={styles.rowText}>
                  <Text style={[styles.label, isDark && styles.textDim]}>Time</Text>
                  <Text style={[styles.value, isDark && styles.textDark]}>{item.startTime} – {item.endTime}</Text>
                </View>
              </View>
              {item.recurring && item.recurring !== 'none' && (
                <>
                  <View style={[styles.divider, isDark && styles.dividerDark]} />
                  <View style={styles.row}>
                    <MaterialIcons name="repeat" size={20} color={config.color} />
                    <View style={styles.rowText}>
                      <Text style={[styles.label, isDark && styles.textDim]}>Recurring</Text>
                      <Text style={[styles.value, isDark && styles.textDark, { textTransform: 'capitalize' }]}>{item.recurring}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {item.notes && (
              <View style={[styles.card, isDark && styles.cardDark, { marginTop: Spacing.md }]}>
                <View style={styles.notesHeader}>
                  <MaterialIcons name="notes" size={20} color={config.color} />
                  <Text style={[styles.notesTitle, isDark && styles.textDark]}>Details</Text>
                </View>
                <Text style={[styles.notesText, isDark && styles.textDim]}>{item.notes}</Text>
              </View>
            )}
            
            <View style={{ height: Spacing.xl }} />
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '80%',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  headerBanner: {
    height: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 2,
    marginLeft: 4,
  },
  aiText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  title: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  textDim: {
    color: '#94A3B8',
  },
  closeBtn: {
    padding: Spacing.sm,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  dividerDark: {
    backgroundColor: '#334155',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
});
