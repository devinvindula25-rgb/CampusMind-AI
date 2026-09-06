import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { InstitutionalActivity } from '@/services/firestoreTypes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  activity: InstitutionalActivity | null;
}

export default function ActivityDetailsModal({ visible, onClose, activity }: Props) {
  const { isDark, Typography: T, BrandColors: Colors } = useThemeEngine();

  if (!activity) return null;

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'accreditation': return '#10B981';
      case 'curriculum': return '#8B5CF6';
      case 'audit': return '#F59E0B';
      case 'document': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#3B82F6';
      case 'action_required': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const mainColor = getActivityColor(activity.type);
  const statusColor = getStatusColor(activity.status);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : [mainColor, mainColor + 'DD']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>{activity.type.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{activity.title}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{activity.timeAgo}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{activity.actor}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.contentSection}>
              {/* Status & Module */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.infoValue, { color: statusColor }]}>{getStatusLabel(activity.status)}</Text>
                  </View>
                </View>
                <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                  <Text style={styles.infoLabel}>Related Module</Text>
                  <Text style={[styles.infoValue, isDark && styles.textDark]}>{activity.relatedModule || 'N/A'}</Text>
                </View>
              </View>

              {/* Description */}
              <View style={[styles.detailSection, isDark && styles.borderDark]}>
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Activity Details</Text>
                <Text style={[styles.descriptionText, isDark && styles.textMutedDark]}>
                  {activity.description}
                </Text>
              </View>

              {/* Next Steps */}
              {activity.nextSteps && (
                <View style={[styles.nextStepsBox, isDark && styles.nextStepsBoxDark]}>
                  <View style={styles.nextStepsHeader}>
                    <MaterialIcons name="arrow-forward" size={20} color={mainColor} />
                    <Text style={[styles.nextStepsTitle, { color: mainColor }]}>Next Steps</Text>
                  </View>
                  <Text style={[styles.nextStepsText, isDark && styles.textDark]}>
                    {activity.nextSteps}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: mainColor }]} onPress={onClose}>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Acknowledge</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    height: SCREEN_HEIGHT * 0.75,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  modalContainerDark: {
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  headerGradient: {
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 10,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  contentSection: {
    padding: Spacing.xl,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  infoBoxDark: {
    backgroundColor: '#1E293B',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  detailSection: {
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: Spacing.xl,
  },
  borderDark: {
    borderBottomColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  nextStepsBox: {
    backgroundColor: '#EFF6FF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  nextStepsBoxDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  nextStepsText: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
