import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, LayoutAnimation, UIManager, Platform, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { CurriculumReview } from '@/services/firestoreTypes';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  review: CurriculumReview | null;
}

export default function CurriculumDetailsModal({ visible, onClose, review }: Props) {
  const { isDark, Typography: T, BrandColors: Colors } = useThemeEngine();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  if (!review) return null;

  const toggleExpand = (code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedModule(expandedModule === code ? null : code);
  };

  const getPriorityConfig = (dueDate: string) => {
    const daysLeft = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (daysLeft < 7) return { label: 'High Priority', color: BrandColors.error, bg: BrandColors.errorBg };
    if (daysLeft < 30) return { label: 'Medium Priority', color: BrandColors.warning, bg: BrandColors.warningBg };
    return { label: 'Low Priority', color: '#64748B', bg: '#F1F5F9' };
  };

  const priority = getPriorityConfig(review.dueDate);
  const modules = review.modules || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : [BrandColors.secondary, '#3B82F6']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: priority.bg }]}>
                  <Text style={[styles.badgeText, { color: priority.color }]}>{priority.label}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{review.reviewType.toUpperCase()} REVIEW</Text>
              <Text style={styles.programmeName}>{review.programmeName}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Due: {review.dueDate}</Text>
                </View>
                {review.targetImplementationDate && (
                  <View style={styles.metaItem}>
                    <MaterialIcons name="flight-takeoff" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.metaText}>Target: {review.targetImplementationDate}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{review.reviewer || 'Unassigned'}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.contentSection}>
              {/* Executive Summary */}
              {review.findings && (
                <View style={[styles.summaryBox, isDark && styles.summaryBoxDark]}>
                  <View style={styles.summaryHeader}>
                    <MaterialIcons name="insights" size={20} color={BrandColors.secondary} />
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>Executive Findings</Text>
                  </View>
                  <Text style={[styles.summaryText, isDark && styles.textMutedDark]}>{review.findings}</Text>
                  
                  {review.budgetRequired && (
                    <View style={styles.budgetRow}>
                      <MaterialIcons name="attach-money" size={16} color={BrandColors.success} />
                      <Text style={[styles.budgetText, isDark && styles.textDark]}>Budget: {review.budgetRequired}</Text>
                    </View>
                  )}

                  {review.recommendations && review.recommendations.length > 0 && (
                    <View style={styles.recommendationsList}>
                      {review.recommendations.map((rec, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <View style={styles.bullet} />
                          <Text style={[styles.bulletText, isDark && styles.textMutedDark]}>{rec}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Stakeholder Feedback */}
              {review.stakeholderFeedback && review.stakeholderFeedback.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Stakeholder Feedback</Text>
                  {review.stakeholderFeedback.map((fb, idx) => (
                    <View key={idx} style={[styles.feedbackCard, isDark && styles.feedbackCardDark]}>
                      <View style={styles.feedbackHeader}>
                        <MaterialIcons name="record-voice-over" size={16} color={BrandColors.accent} />
                        <Text style={[styles.feedbackRole, isDark && styles.textDark]}>{fb.role}</Text>
                        <Text style={styles.feedbackDate}>{fb.date}</Text>
                      </View>
                      <Text style={[styles.feedbackComment, isDark && styles.textMutedDark]}>"{fb.comment}"</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Modules Under Review</Text>
              
              <View style={styles.modulesList}>
                {modules.map((mod) => {
                  const isExpanded = expandedModule === mod.code;
                  
                  return (
                    <View key={mod.code} style={[styles.moduleCard, isDark && styles.moduleCardDark]}>
                      <TouchableOpacity 
                        style={styles.moduleHeader} 
                        activeOpacity={0.7} 
                        onPress={() => toggleExpand(mod.code)}
                      >
                        <View style={styles.moduleIconContainer}>
                          <MaterialIcons name="library-books" size={20} color={BrandColors.secondary} />
                        </View>
                        <View style={styles.moduleHeaderContent}>
                          <Text style={[styles.moduleCode, isDark && styles.textDark]}>{mod.code}</Text>
                          <Text style={[styles.moduleTitle, isDark && styles.textMutedDark]} numberOfLines={isExpanded ? undefined : 1}>
                            {mod.title}
                          </Text>
                        </View>
                        <MaterialIcons 
                          name={isExpanded ? "expand-less" : "expand-more"} 
                          size={24} 
                          color={isDark ? '#94A3B8' : '#64748B'} 
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.moduleDetails, isDark && styles.moduleDetailsDark]}>
                          <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>SLQF Alignment</Text>
                            <Text style={[styles.detailText, isDark && styles.textDark]}>{mod.slqfAlignment}</Text>
                          </View>
                          
                          <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>Current Issues</Text>
                            <Text style={[styles.detailText, { color: BrandColors.error }]}>{mod.issues}</Text>
                          </View>

                          <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>Proposed Changes</Text>
                            <Text style={[styles.detailText, { color: BrandColors.success }]}>{mod.proposedChanges}</Text>
                          </View>

                          {mod.competencies && mod.competencies.length > 0 && (
                            <View style={styles.detailBlock}>
                              <Text style={styles.detailLabel}>Target Competencies</Text>
                              <View style={styles.competenciesWrap}>
                                {mod.competencies.map(comp => (
                                  <View key={comp} style={[styles.competencyBadge, isDark && styles.competencyBadgeDark]}>
                                    <Text style={[styles.competencyText, isDark && styles.textMutedDark]}>{comp}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          <View style={styles.metaChipsRow}>
                            <View style={[styles.metaChip, isDark && styles.metaChipDark]}>
                              <Text style={styles.metaChipText}>{mod.credits} Credits</Text>
                            </View>
                          </View>

                          {mod.documents && mod.documents.length > 0 && (
                            <View style={styles.evidenceSection}>
                              <Text style={styles.detailLabel}>Attached Syllabus Documents</Text>
                              {mod.documents.map((ev, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={[styles.evidenceFile, isDark && styles.evidenceFileDark]}
                                  onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't load page", err))}
                                >
                                  <MaterialIcons name="picture-as-pdf" size={16} color={BrandColors.error} />
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
                {review.status === 'in_progress' ? (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => {
                      const msg = `Complete review for ${review.programmeName}?`;
                      if (Platform.OS === 'web') {
                        if (window.confirm(msg)) onClose();
                      } else {
                        Alert.alert('Confirm Completion', msg, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Complete', onPress: onClose }
                        ]);
                      }
                    }}
                  >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Complete Review</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.submitBtn]}
                    onPress={() => {
                      const msg = `Send ${review.programmeName} review for approval?`;
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
                    <Text style={styles.actionBtnText}>Send for Approval</Text>
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
    height: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  modalContainerDark: {
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
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
    fontSize: 11,
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
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  programmeName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
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
  summaryBox: {
    backgroundColor: '#fff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  summaryBoxDark: {
    backgroundColor: '#1E293B',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  summaryText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  recommendationsList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.secondary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.successBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.success,
  },
  feedbackSection: {
    marginBottom: Spacing.xl,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  feedbackCardDark: {
    backgroundColor: '#1E293B',
    borderLeftColor: BrandColors.accent,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feedbackRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  feedbackDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: Spacing.lg,
  },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  modulesList: {
    gap: Spacing.md,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moduleCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  moduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleHeaderContent: {
    flex: 1,
  },
  moduleCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 14,
    color: '#64748B',
  },
  moduleDetails: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  moduleDetailsDark: {
    borderTopColor: '#334155',
  },
  detailBlock: {
    marginTop: Spacing.lg,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  metaChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  metaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  metaChipDark: {
    backgroundColor: '#0F172A',
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  competenciesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  competencyBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  competencyBadgeDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  competencyText: {
    fontSize: 12,
    color: BrandColors.secondary,
    fontWeight: '600',
  },
  evidenceSection: {
    marginTop: Spacing.lg,
  },
  evidenceFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    marginTop: 6,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evidenceFileDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  evidenceFileName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
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
