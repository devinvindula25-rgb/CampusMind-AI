import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, LayoutAnimation, UIManager, Platform, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { ComplianceReport } from '@/services/firestoreTypes';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  report: ComplianceReport | null;
  onSendToQA: (reportId: string) => void;
}

export default function ReportDetailsModal({ visible, onClose, report, onSendToQA }: Props) {
  const { isDark, BrandColors: Colors } = useThemeEngine();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  if (!report) return null;

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === index ? null : index);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant': return BrandColors.success;
      case 'at_risk': return BrandColors.warning;
      case 'action_required': return BrandColors.error;
      default: return '#3B82F6';
    }
  };

  const sections = report.sections || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : ['#3B82F6', '#1A1A2E']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>AI DRAFT - {report.status.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{report.title}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="auto-awesome" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>Generated: {report.generationDate ? new Date(report.generationDate).toLocaleDateString() : report.period}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>By: {report.createdBy}</Text>
                </View>
              </View>

              {report.aiConfidenceScore !== undefined && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>AI Confidence</Text>
                  <Text style={styles.scoreValue}>{report.aiConfidenceScore}%</Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.contentSection}>
              
              {/* Executive Summary */}
              {report.executiveSummary && (
                <View style={[styles.summaryBox, isDark && styles.summaryBoxDark]}>
                  <View style={styles.summaryHeader}>
                    <MaterialIcons name="format-quote" size={20} color={BrandColors.secondary} />
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>AI Executive Summary</Text>
                  </View>
                  <Text style={[styles.summaryText, isDark && styles.textMutedDark]}>{report.executiveSummary}</Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Detailed Sections</Text>
              
              <View style={styles.sectionsList}>
                {sections.map((sec, idx) => {
                  const isExpanded = expandedSection === idx;
                  const sColor = getStatusColor(sec.status);
                  
                  return (
                    <View key={idx} style={[styles.sectionCard, isDark && styles.sectionCardDark, { borderLeftColor: sColor }]}>
                      <TouchableOpacity 
                        style={styles.sectionHeader} 
                        activeOpacity={0.7} 
                        onPress={() => toggleExpand(idx)}
                      >
                        <View style={styles.sectionHeaderContent}>
                          <View style={styles.sectionTitleRow}>
                            <Text style={[styles.sectionHeaderText, isDark && styles.textDark]}>{sec.title}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: sColor + '20' }]}>
                              <Text style={[styles.statusBadgeText, { color: sColor }]}>{sec.status.replace('_', ' ')}</Text>
                            </View>
                          </View>
                          {sec.score !== undefined && (
                            <Text style={[styles.sectionScore, isDark && styles.textMutedDark]}>Score: {sec.score}/100</Text>
                          )}
                        </View>
                        <MaterialIcons 
                          name={isExpanded ? "expand-less" : "expand-more"} 
                          size={24} 
                          color={isDark ? '#94A3B8' : '#64748B'} 
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.sectionDetails, isDark && styles.sectionDetailsDark]}>
                          
                          {sec.content && (
                            <View style={styles.detailBlock}>
                              <Text style={styles.detailLabel}>AI Analysis</Text>
                              <Text style={[styles.detailText, isDark && styles.textDark]}>{sec.content}</Text>
                            </View>
                          )}

                          {sec.aiRecommendations && sec.aiRecommendations.length > 0 && (
                            <View style={styles.detailBlock}>
                              <Text style={styles.detailLabel}>Recommendations</Text>
                              {sec.aiRecommendations.map((rec, rIdx) => (
                                <View key={rIdx} style={styles.bulletRow}>
                                  <View style={[styles.bullet, { backgroundColor: BrandColors.secondary }]} />
                                  <Text style={[styles.bulletText, isDark && styles.textDark]}>{rec}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {sec.evidenceFiles && sec.evidenceFiles.length > 0 && (
                            <View style={styles.detailBlock}>
                              <Text style={styles.detailLabel}>Source Evidence</Text>
                              {sec.evidenceFiles.map((ev, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={[styles.evidenceFile, isDark && styles.evidenceFileDark]}
                                  onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't open URL", err))}
                                >
                                  <MaterialIcons name="insert-drive-file" size={16} color={BrandColors.accent} />
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

            </View>
          </ScrollView>

          {report.status === 'draft' && (
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <TouchableOpacity 
                style={styles.qaButton} 
                onPress={() => onSendToQA(report.id!)}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.qaButtonText}>Approve & Send to QA</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    paddingBottom: Spacing['3xl'],
  },
  headerGradient: {
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 20,
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
    color: '#fff',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingRight: 110,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  contentSection: {
    padding: Spacing.xl,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  summaryBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
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
  sectionsList: {
    gap: Spacing.md,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  sectionCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sectionScore: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionDetails: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionDetailsDark: {
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
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingRight: Spacing.md,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
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
  footer: {
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerDark: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
  },
  qaButton: {
    backgroundColor: BrandColors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  qaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});
