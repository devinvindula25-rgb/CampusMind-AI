import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, LayoutAnimation, UIManager, Platform, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { AccreditationRecord } from '@/services/firestoreTypes';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  record: AccreditationRecord | null;
}

export default function AccreditationDetailsModal({ visible, onClose, record }: Props) {
  const { isDark, Typography: T, BrandColors: Colors } = useThemeEngine();
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

  if (!record) return null;

  const toggleExpand = (code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStandard(expandedStandard === code ? null : code);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Active', color: BrandColors.success, bg: BrandColors.successBg };
      case 'expiring_soon': return { label: 'Expiring Soon', color: BrandColors.warning, bg: BrandColors.warningBg };
      case 'expired': return { label: 'Expired', color: BrandColors.error, bg: BrandColors.errorBg };
      case 'under_review': return { label: 'Under Review', color: BrandColors.info, bg: BrandColors.infoBg };
      default: return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const getStandardStatusConfig = (status: string) => {
    switch (status) {
      case 'met':
      case 'completed': return { icon: 'check-circle', color: BrandColors.success, label: 'Met' };
      case 'pending': return { icon: 'schedule', color: BrandColors.warning, label: 'Pending' };
      case 'unmet': return { icon: 'error', color: BrandColors.error, label: 'Unmet' };
      default: return { icon: 'help', color: '#64748B', label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(record.status);
  const standards = record.standards || [];
  const complianceScore = record.complianceScore || 0;
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : [BrandColors.primary, '#1E40AF']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.accreditingBody}>{record.accreditingBody} Accreditation</Text>
              <Text style={styles.programmeName}>{record.programmeName}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Due: {record.expiryDate}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="school" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>SLQF Level {record.slqfLevel || 'N/A'}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.contentSection}>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, isDark && styles.statBoxDark]}>
                  <MaterialIcons name="military-tech" size={24} color={BrandColors.accent} />
                  <Text style={[styles.statValue, isDark && styles.textDark]}>{complianceScore}%</Text>
                  <Text style={styles.statLabel}>Compliance Score</Text>
                </View>
                <View style={[styles.statBox, isDark && styles.statBoxDark]}>
                  <MaterialIcons name="book" size={24} color={BrandColors.secondary} />
                  <Text style={[styles.statValue, isDark && styles.textDark]}>{record.totalCreditsRequired || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Target Credits</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>SLQF Standards Framework</Text>
              
              <View style={styles.standardsList}>
                {standards.map((std, idx) => {
                  const stdConfig = getStandardStatusConfig(std.status);
                  const isExpanded = expandedStandard === std.code;
                  
                  return (
                    <View key={std.code} style={[styles.standardCard, isDark && styles.standardCardDark]}>
                      <TouchableOpacity 
                        style={styles.standardHeader} 
                        activeOpacity={0.7} 
                        onPress={() => toggleExpand(std.code)}
                      >
                        <MaterialIcons name={stdConfig.icon as any} size={24} color={stdConfig.color} />
                        <View style={styles.standardHeaderContent}>
                          <Text style={[styles.standardCode, isDark && styles.textDark]}>{std.code}</Text>
                          <Text style={[styles.standardTitle, isDark && styles.textMutedDark]} numberOfLines={isExpanded ? undefined : 1}>
                            {std.title}
                          </Text>
                        </View>
                        <MaterialIcons 
                          name={isExpanded ? "expand-less" : "expand-more"} 
                          size={24} 
                          color={isDark ? '#94A3B8' : '#64748B'} 
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.standardDetails, isDark && styles.standardDetailsDark]}>
                          <Text style={[styles.stdDescription, isDark && styles.textDark]}>{std.description}</Text>
                          
                          <View style={styles.stdMetaRow}>
                            <View style={styles.stdMetaItem}>
                              <MaterialIcons name="person" size={16} color="#64748B" />
                              <Text style={[styles.stdMetaText, isDark && styles.textMutedDark]}>{std.assignee || 'Unassigned'}</Text>
                            </View>
                            <View style={styles.stdMetaItem}>
                              <MaterialIcons name="event" size={16} color="#64748B" />
                              <Text style={[styles.stdMetaText, isDark && styles.textMutedDark]}>{std.dueDate || 'No Date'}</Text>
                            </View>
                          </View>

                          {std.feedback && (
                            <View style={[styles.feedbackBox, isDark && styles.feedbackBoxDark]}>
                              <MaterialIcons name="forum" size={16} color={BrandColors.info} />
                              <Text style={[styles.feedbackText, isDark && styles.textDark]}>{std.feedback}</Text>
                            </View>
                          )}

                          {std.evidenceList && std.evidenceList.length > 0 && (
                            <View style={styles.evidenceSection}>
                              <Text style={[styles.evidenceTitle, isDark && styles.textMutedDark]}>Attached Evidence:</Text>
                              {std.evidenceList.map((ev, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={[styles.evidenceFile, isDark && styles.evidenceFileDark]}
                                  onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't load page", err))}
                                >
                                  <MaterialIcons name="attach-file" size={16} color={BrandColors.accent} />
                                  <Text style={[styles.evidenceFileName, isDark && styles.textDark]}>{ev.name}</Text>
                                  <MaterialIcons name="open-in-new" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                {record.status === 'under_review' ? (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => {
                      const msg = `Approve ${record.accreditingBody} accreditation?`;
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
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.submitBtn]}
                    onPress={() => {
                      const msg = `Submit ${record.accreditingBody} for review?`;
                      if (Platform.OS === 'web') {
                        if (window.confirm(msg)) onClose();
                      } else {
                        Alert.alert('Confirm Submission', msg, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Submit', onPress: onClose }
                        ]);
                      }
                    }}
                  >
                    <MaterialIcons name="send" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Send for Review</Text>
                  </TouchableOpacity>
                )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    height: SCREEN_HEIGHT * 0.85,
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
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accreditingBody: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  programmeName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  contentSection: {
    padding: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statBoxDark: {
    backgroundColor: '#1E293B',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: Spacing.lg,
  },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  standardsList: {
    gap: Spacing.md,
  },
  standardCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  standardCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  standardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  standardHeaderContent: {
    flex: 1,
  },
  standardCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  standardTitle: {
    fontSize: 14,
    color: '#64748B',
  },
  standardDetails: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  standardDetailsDark: {
    borderTopColor: '#334155',
  },
  stdDescription: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  stdMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stdMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stdMetaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BrandColors.infoBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  feedbackBoxDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.info,
    lineHeight: 18,
  },
  evidenceSection: {
    marginTop: Spacing.sm,
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  evidenceFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evidenceFileDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  evidenceFileName: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
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
    backgroundColor: BrandColors.primary,
  },
  approveBtn: {
    backgroundColor: BrandColors.success,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
